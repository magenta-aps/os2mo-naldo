import { writable } from "svelte/store"

interface SuccessAlert {
  message: string
  uuid?: string | null
  type?: "employee" | "organisation" | "clipboard"
  timeOutTime?: number
  tab: string
}

interface ErrorAlert {
  message: string
  timeOutTime?: number
}

const defaultSuccessAlert: SuccessAlert = { message: "", tab: "" }
const defaultErrorAlert: ErrorAlert = { message: "" }

export const success = writable(defaultSuccessAlert)
export const error = writable(defaultErrorAlert)
