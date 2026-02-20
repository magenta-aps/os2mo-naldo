import { writable } from "svelte/store"

interface SuccessAlert {
  message: string
  uuid?: string | null
  type?:
    | "employee"
    | "organisation"
    | "class"
    | "itsystem"
    | "clipboard"
    | "connections"
  timeOutTime?: number
}

interface ErrorAlert {
  message: any
  timeOutTime?: number
}

interface WarningAlert {
  message: any
  timeOutTime?: number
}

const defaultSuccessAlert: SuccessAlert = { message: "" }
const defaultErrorAlert: ErrorAlert = { message: "" }
const defaultWarningAlert: WarningAlert = { message: "" }

export const success = writable(defaultSuccessAlert)
export const error = writable(defaultErrorAlert)
export const warning = writable(defaultWarningAlert)
