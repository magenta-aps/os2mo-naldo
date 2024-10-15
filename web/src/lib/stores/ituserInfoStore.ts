import { browser } from "$app/environment"
import { writable } from "svelte/store"

type ItUserInfo = {
  person: string
  fromDate: string
  toDate: string
  itSystem: { uuid: string; name: string }
  userkey: string
  notes: string
  primary: { uuid: string; name?: string; user_key: string }
  validated: boolean
}

const defaultValue: ItUserInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  itSystem: { uuid: "", name: "" },
  userkey: "",
  notes: "",
  primary: { uuid: "", name: "", user_key: "" },
  validated: false,
}

const createItUserInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedItUserInfo = localStorage.getItem("ituser-info")
    initialValue = storedItUserInfo ? JSON.parse(storedItUserInfo) : defaultValue
  }

  const { subscribe, update, set } = writable<ItUserInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("ituser-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((ituserStore) => {
      ituserStore.validated = valid
      return ituserStore
    })
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("ituser-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const ituserInfo = createItUserInfoStore()
