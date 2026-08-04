import { onDestroy } from "svelte"
import { writable, type Readable } from "svelte/store"

export type QueryState<T> = {
  // Last successful value. Intentionally kept on failure, so when `error` is
  // true `data` may be the previous (now stale) value rather than undefined.
  data: T | undefined
  loading: boolean
  error: boolean
}

export type Query<T> = Readable<QueryState<T>> & {
  // Trigger a fetch. Aborts any in-flight request, keeps the previous `data`
  // visible during the refetch (so fields rendered from it stay mounted),
  // ignores the abort of a superseded request, and flags real failures.
  //
  // Drive this from a Svelte reactive statement, with the inputs written INLINE
  // so Svelte's compiler collects them as dependencies:
  //   $: q.run((signal) => fetchThing(startDate, orgUnit, signal))  // refetches
  //   $: q.run(myFetcher)                                           // does NOT (no deps in the statement)
  run: (fetcher: (signal: AbortSignal) => Promise<T>) => void
}

// A reactive query bound to the current component's lifecycle. Centralises the
// fetch dance (abort previous, keep last data across refetches, ignore the abort
// of a superseded request, surface real errors, clean up on destroy) so forms
// don't each re-implement it.
//
// Must be called during component initialisation — it registers `onDestroy`, so
// it can't be created lazily in an event handler or at module scope.
//
// For a worked example and the accepted UX trade-offs (disabled facet selects,
// refetch/error gaps), see the employee edit engagement form
// (routes/(app)/employee/[uuid]/edit/engagement) — the reference implementation.
export const createQuery = <T>(initial?: T): Query<T> => {
  const { subscribe, set, update } = writable<QueryState<T>>({
    data: initial,
    loading: false,
    error: false,
  })

  let controller: AbortController | undefined
  onDestroy(() => controller?.abort())

  const run = (fetcher: (signal: AbortSignal) => Promise<T>) => {
    controller?.abort()
    const current = (controller = new AbortController())
    update((s) => ({ ...s, loading: true, error: false }))
    // Start via `Promise.resolve().then(...)` so a *synchronous* throw in
    // `fetcher` becomes a rejection we handle, rather than escaping `run` and
    // leaving the store stuck at `loading: true`.
    Promise.resolve()
      .then(() => fetcher(current.signal))
      .then((data) => {
        if (current.signal.aborted) return
        set({ data, loading: false, error: false })
      })
      .catch(() => {
        // Only swallow the abort of *our own* request. Any other rejection is a
        // real, recoverable failure — including an AbortError the fetcher caused
        // itself (e.g. `graphQLClient` composes our signal with a timeout via
        // `AbortSignal.any`), which must not be silently ignored.
        if (current.signal.aborted) return
        update((s) => ({ ...s, loading: false, error: true }))
      })
  }

  return { subscribe, run }
}
