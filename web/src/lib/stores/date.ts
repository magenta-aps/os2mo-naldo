import { today } from "$lib/utils/date"
import { writable } from "svelte/store"

export const date = writable(today())
