import { writable } from "svelte/store"

export const date = writable(new Date().toISOString().split("T")[0])
