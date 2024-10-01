import { browser } from "$app/environment"
import { writable } from "svelte/store"

type ManagerInfo = {
  person: string
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string }
  managerType: { uuid: string; name: string; userkey: string }
  managerLevel: { uuid: string; name: string; userkey: string }
  responsibilities: { uuid: string; name: string; userkey: string }[] | undefined
}

const defaultValue: ManagerInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  orgUnit: { uuid: "", name: "" },
  managerType: { uuid: "", name: "", userkey: "" },
  managerLevel: { uuid: "", name: "", userkey: "" },
  responsibilities: undefined,
}

const createManagerInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedManagerInfo = localStorage.getItem("manager-info")
    initialValue = storedManagerInfo ? JSON.parse(storedManagerInfo) : defaultValue
  }

  const { subscribe, set } = writable<ManagerInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("manager-info")
    set(defaultValue)
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("manager-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
  }
}

export const managerInfo = createManagerInfoStore()
