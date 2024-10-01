import { browser } from "$app/environment"
import { writable } from "svelte/store"

type ManagerInfo = {
  person: string
  fromDate: string
  toDate: string
  visibility: { uuid: string; name: string; userkey: string } | undefined
  addressType:
    | { uuid: string; name: string; userkey: string; scope: string }
    | undefined
  addressValue: string
}

const defaultValue: ManagerInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  visibility: undefined,
  addressType: undefined,
  addressValue: "",
}

const createManagerInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedManagerInfo = localStorage.getItem("address-info")
    initialValue = storedManagerInfo ? JSON.parse(storedManagerInfo) : defaultValue
  }

  const { subscribe, set } = writable<ManagerInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("address-info")
    set(defaultValue)
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("address-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
  }
}

export const addressInfo = createManagerInfoStore()
