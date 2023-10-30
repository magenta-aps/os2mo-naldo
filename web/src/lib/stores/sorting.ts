import { writable } from "svelte/store"

export const sortKey = writable("objects.0.address_type.name")
export const sortDirection = writable(1)
