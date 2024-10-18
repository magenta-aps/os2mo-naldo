import { browser } from "$app/environment"
import { writable } from "svelte/store"

type RolebindingInfo = {
  fromDate: string
  toDate: string
  role: { uuid: string; name: string; user_key: string }
  validated: boolean
}

const defaultValue: RolebindingInfo = {
  fromDate: "",
  toDate: "",
  role: { uuid: "", name: "", user_key: "" },
  validated: false,
}

const createRolebindingInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedRolebindingInfo = localStorage.getItem("rolebinding-info")
    initialValue = storedRolebindingInfo
      ? JSON.parse(storedRolebindingInfo)
      : defaultValue
  }

  const { subscribe, update, set } = writable<RolebindingInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("rolebinding-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((rolebindingStore) => {
      rolebindingStore.validated = valid
      return rolebindingStore
    })
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("rolebinding-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const rolebindingInfo = createRolebindingInfoStore()
