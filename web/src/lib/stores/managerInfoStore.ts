import { browser } from "$app/environment"
import { writable } from "svelte/store"

type ManagerInfo = {
  person: string
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  managerType: { uuid: string; name: string; userkey: string }
  managerLevel: { uuid: string; name: string; userkey: string }
  responsibilities: { uuid: string; name: string; userkey: string }[]
  validated: boolean
}

const defaultValue: ManagerInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  orgUnit: undefined,
  managerType: { uuid: "", name: "", userkey: "" },
  managerLevel: { uuid: "", name: "", userkey: "" },
  responsibilities: [],
  validated: false,
}

const createManagerInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedManagerInfo = localStorage.getItem("manager-info")
    initialValue = storedManagerInfo ? JSON.parse(storedManagerInfo) : defaultValue
  }

  const { subscribe, update, set } = writable<ManagerInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("manager-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((managerStore) => {
      managerStore.validated = valid
      return managerStore
    })
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("manager-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const managerInfo = createManagerInfoStore()
