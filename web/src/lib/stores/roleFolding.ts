import { writable } from "svelte/store"

const folded = writable<Set<string | null>>(new Set())

export const foldedITSystems = {
  subscribe: folded.subscribe,
  toggle: (uuid: string | null) =>
    folded.update((current) => {
      const next = new Set(current)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return next
    }),
}
