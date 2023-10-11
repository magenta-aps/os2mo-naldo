import { writable } from "svelte/store"

// Gemmer et objekt, så det er let at få fat i både uuid og navn til beskeder og andre visninger
interface SelectedOrg {
  uuid: string
  name: string
}

// enkelt uuid og navn (allowMultipleSelection=false)
export const selectedOriginOrg = writable<SelectedOrg | null>(null)

// liste af uuid'er og navne (allowMultipleSelection=true)
export const selectedDestinationsOrgs = writable<SelectedOrg[]>([])
