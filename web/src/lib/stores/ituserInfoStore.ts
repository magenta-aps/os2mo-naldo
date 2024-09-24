import { browser } from "$app/environment"
import { writable } from "svelte/store"

type ItUserInfo = {
  person: string
  fromDate: string
  toDate: string
  itSystem: { uuid: string; name: string }
  userkey: string
  ituserType: { uuid: string; name: string; userkey: string }
  primary: string
}

const defaultValue: ItUserInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  itSystem: { uuid: "", name: "" },
  userkey: "",
  ituserType: { uuid: "", name: "", userkey: "" },
  primary: "",
}

const createItUserInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedItUserInfo = localStorage.getItem("ituser-info")
    initialValue = storedItUserInfo ? JSON.parse(storedItUserInfo) : defaultValue
  }

  const { subscribe, set } = writable<ItUserInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("ituser-info")
    set(defaultValue)
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("ituser-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
  }
}

export const ituserInfo = createItUserInfoStore()
