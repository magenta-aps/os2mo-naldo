import { browser } from "$app/environment"
import { writable, get } from "svelte/store"
import { date } from "$lib/stores/date"

export type AddressInfo = {
  fromDate: string
  toDate: string
  visibility: { uuid: string; name: string; userkey: string } | undefined
  addressType: { uuid: string; name: string; userkey: string; scope: string }
  addressValue: { name?: string; value: string }
  userkey: string
  validated?: boolean
}

export const createDefaultAddress = (): AddressInfo => ({
  fromDate: get(date),
  toDate: "",
  visibility: undefined,
  addressType: { uuid: "", name: "", userkey: "", scope: "" },
  addressValue: { name: "", value: "" },
  userkey: "",
  validated: undefined,
})

export const validateAddress = (address: AddressInfo): boolean => {
  return (
    !!address.fromDate && !!address.addressType?.uuid && !!address.addressValue.value
  )
}

export const addressInfo = (() => {
  const defaultValue: AddressInfo[] = [createDefaultAddress()]

  let initialValue = defaultValue

  if (browser) {
    const stored = localStorage.getItem("address-info")
    initialValue = stored ? JSON.parse(stored) : defaultValue
  }

  const { subscribe, update, set } = writable<AddressInfo[]>(initialValue)

  subscribe((value) => {
    if (browser) localStorage.setItem("address-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    update,
    reset: () => {
      if (browser) localStorage.removeItem("address-info")
      set([createDefaultAddress()])
    },
    addAddress: (newAddress: AddressInfo) =>
      update((addresses) => [...addresses, newAddress]),
    updateAddressAtIndex: (index: number, updater: (e: AddressInfo) => AddressInfo) =>
      update((addresses) =>
        addresses.map((address, i) => (i === index ? updater(address) : address))
      ),
    isValid: (valid: boolean) =>
      update((addresses) =>
        addresses.map((a) => ({
          ...a,
          validated: valid,
        }))
      ),
  }
})()
