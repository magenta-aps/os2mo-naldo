import { writable } from "svelte/store"

export const tenses = writable({ past: false, present: true, future: false })
