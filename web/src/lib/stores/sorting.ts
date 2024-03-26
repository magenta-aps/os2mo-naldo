import { writable } from "svelte/store"

export const sortKey = writable("validity.from")
export const sortDirection = writable(-1)
