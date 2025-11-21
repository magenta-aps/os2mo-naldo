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

  const { subscribe, update, set } = writable<AddressInfo[]>(defaultValue)

  return {
    subscribe,
    set,
    update,
    reset: () => {
      set([createDefaultAddress()])
    },
    addAddress: () => update((addresses) => [...addresses, createDefaultAddress()]),
    removeAddress: (addressIndex: number) =>
      update((addresses) => addresses.toSpliced(addressIndex, 1)),
    validateForm: () => {
      let isValid = false

      update((addresses) => {
        const updated = addresses.map((address) => {
          return { ...address, validated: validateAddress(address) }
        })
        isValid = updated.every((address) => address.validated)

        return updated
      })
      return isValid
    },
  }
})()
