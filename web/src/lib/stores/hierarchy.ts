import { writable } from "svelte/store"

export const orgUnitHierarchyStore = writable<string | null>(null)
