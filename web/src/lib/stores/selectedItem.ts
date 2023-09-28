import { writable } from "svelte/store"

/* Gemmer et objekt, så det er let at få fat i både uuid og navn til beskeder og andre visninger */
interface SelectedOrg {
  uuid: string
  name: string
}
// opbevare et enkelt uuid og navn (allowMultipleSelection=false)
export const selectedOriginUuid = writable<SelectedOrg | null>(null)

// opbevare en liste af uuidér og navne (allowMultipleSelection=true)
export const selectedDestinationUuids = writable<SelectedOrg[]>([])
