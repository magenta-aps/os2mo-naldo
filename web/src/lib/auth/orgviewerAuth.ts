export let orgviewerToken: string | undefined

const MAX_BACKOFF_MS = 30_000

// Exported for testing: exponential backoff with a cap, doubling per
// consecutive failure (1s, 2s, 4s, ... capped at 30s).
export const backoffDelayMs = (failureCount: number): number =>
  Math.min(1000 * 2 ** failureCount, MAX_BACKOFF_MS)

const scheduleNext = (delayMs: number, run: () => void) => {
  setTimeout(run, delayMs)
}

const refresh = async (failureCount = 0) => {
  try {
    const res = await fetch("/api/orgviewer-token")
    if (!res.ok) throw new Error(`Token endpoint failed: ${res.status}`)

    const { access_token, expires_in } = await res.json()
    orgviewerToken = access_token

    // Refresh before expiry, with jitter so many open tabs don't all hit
    // the endpoint at the same moment.
    const jitter = 0.9 + Math.random() * 0.2
    scheduleNext(expires_in * 0.75 * 1000 * jitter, () => refresh(0))
  } catch (err) {
    console.error("Failed to refresh orgviewer token:", err)
    scheduleNext(backoffDelayMs(failureCount), () => refresh(failureCount + 1))
  }
}

export const initOrgviewerAuth = async () => {
  await refresh()
}
