import { get } from "svelte/store"
import { date } from "$lib/stores/date"
import { createMultiStepStore } from "$lib/stores/createStepStore"

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

const store = createMultiStepStore(createDefaultAddress, validateAddress)

export const addressInfo = {
  ...store,
  addAddress: store.addItem,
  removeAddress: store.removeItem,
}
