import { writable } from "svelte/store"

export const defaultSortKey = "validity.from"
export const defaultSortDirection = -1

export const sortKey = writable(defaultSortKey)
export const sortDirection = writable(defaultSortDirection)
