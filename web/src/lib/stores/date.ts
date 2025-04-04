import { formatInTimeZone } from "date-fns-tz"
import { writable } from "svelte/store"

export const date = writable(
  formatInTimeZone(new Date(), "Europe/Copenhagen", "yyyy-MM-dd")
)
