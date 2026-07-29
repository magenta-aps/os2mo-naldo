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
}

interface ErrorAlert {
  message: any
}

interface WarningAlert {
  message: any
}

const defaultSuccessAlert: SuccessAlert = { message: "" }
const defaultErrorAlert: ErrorAlert = { message: "" }
const defaultWarningAlert: WarningAlert = { message: "" }

const alertStore = <T>(empty: T, timeOut = 5000) => {
  const store = writable<T>(empty)
  let timer: ReturnType<typeof setTimeout> | undefined

  const clear = () => {
    clearTimeout(timer)
    store.set(empty)
  }

  return {
    subscribe: store.subscribe,
    clear,
    set: (alert: T) => {
      clearTimeout(timer)
      store.set(alert)
      timer = setTimeout(clear, timeOut)
    },
  }
}

export const success = alertStore(defaultSuccessAlert)
export const error = alertStore(defaultErrorAlert)
export const warning = alertStore(defaultWarningAlert)
