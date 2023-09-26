import { writable } from "svelte/store"
/* 
// For flere uuidër (multiSelect)
export const selectedDestinationUuids = writable<Set<string>>(new Set())

// For enkelt uuid
export const selectedOriginUuid = writable<string | null>(null)
 */

interface SelectedOrg {
  uuid: string
  name: string
}

export const selectedOriginUuid = writable<SelectedOrg | null>(null)

export const selectedDestinationUuids = writable<SelectedOrg[]>([])
