import { writable } from "svelte/store"

interface SuccessAlert {
  message: string
  uuid: string
  type: "employee" | "organisation"
  timeOutTime?: number
}

interface ErrorAlert {
  message: string
  timeOutTime?: number
}

const defaultSuccessAlert: SuccessAlert = { message: "", type: "employee", uuid: "" }
const defaultErrorAlert: ErrorAlert = { message: "" }

export const success = writable(defaultSuccessAlert)
export const error = writable(defaultErrorAlert)
