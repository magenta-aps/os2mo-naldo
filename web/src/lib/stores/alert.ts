import { writable } from "svelte/store"

interface SuccessAlert {
  message: string
  uuid?: string | null
  type?: "employee" | "organisation" | "admin" | "clipboard" | "connections"
  timeOutTime?: number
}

interface ErrorAlert {
  message: any
  timeOutTime?: number
}

const defaultSuccessAlert: SuccessAlert = { message: "" }
const defaultErrorAlert: ErrorAlert = { message: "" }

export const success = writable(defaultSuccessAlert)
export const error = writable(defaultErrorAlert)
