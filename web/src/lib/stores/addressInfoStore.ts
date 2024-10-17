import { browser } from "$app/environment"
import { writable } from "svelte/store"

type AddressInfo = {
  fromDate: string
  toDate: string
  visibility: { uuid: string; name: string; userkey: string } | undefined
  addressType: { uuid: string; name: string; userkey: string; scope: string }
  addressValue: { name?: string; value: string } | string
  userkey: string
  validated: boolean
}

const defaultValue: AddressInfo = {
  fromDate: "",
  toDate: "",
  visibility: undefined,
  addressType: { uuid: "", name: "", userkey: "", scope: "" },
  addressValue: { name: "", value: "" },
  userkey: "",
  validated: false,
}

const createAddressInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedAddressInfo = localStorage.getItem("address-info")
    initialValue = storedAddressInfo ? JSON.parse(storedAddressInfo) : defaultValue
  }

  const { subscribe, update, set } = writable<AddressInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("address-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((addressStore) => {
      addressStore.validated = valid
      return addressStore
    })
  }

  subscribe((value) => {
    if (browser) {
      localStorage.setItem("address-info", JSON.stringify(value))
    }
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const addressInfo = createAddressInfoStore()
