// Value shapes bound as each field group's `value`: the create routes seed a
// createDefaultXValues() object, the wizard binds a store item of the same
// shape plus its own extras.

import { get } from "svelte/store"
import { date } from "$lib/stores/date"

// Mirrors the shared Select's Value shape, where uuid is nullable.
export type ClassValue = {
  uuid: string | null
  name: string
  user_key?: string | null
}

export type EmployeeValues = {
  // Matches CprLookup's response shape; `name` is "" for fictional CPRs
  // (typed name) and non-empty for looked-up ones (derived name).
  cprNumber: { name: string; cpr_no: string }
  firstName: string
  lastName: string
  nicknameFirstname: string
  nicknameLastname: string
}

export const createDefaultEmployeeValues = (): EmployeeValues => ({
  cprNumber: { name: "", cpr_no: "" },
  firstName: "",
  lastName: "",
  nicknameFirstname: "",
  nicknameLastname: "",
})

export type EngagementValues = {
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  user_key: string
  jobFunction: ClassValue | undefined
  engagementType: ClassValue | undefined
  primary: ClassValue | undefined
  extension1: string
  extension4: string
}

export const createDefaultEngagementValues = (): EngagementValues => ({
  fromDate: get(date),
  toDate: "",
  orgUnit: undefined,
  user_key: "",
  jobFunction: undefined,
  engagementType: undefined,
  primary: undefined,
  extension1: "",
  extension4: "",
})

// Address types carry their scope (EMAIL/PHONE/DAR/...), which drives the
// value field's validators and widget.
export type AddressTypeValue = ClassValue & { scope?: string | null }

export type AddressValues = {
  fromDate: string
  toDate: string
  visibility: ClassValue | undefined
  addressType: AddressTypeValue | undefined
  addressValue: { name?: string; value: string }
  user_key: string
}

export const createDefaultAddressValues = (): AddressValues => ({
  fromDate: get(date),
  toDate: "",
  visibility: undefined,
  addressType: undefined,
  addressValue: { name: "", value: "" },
  user_key: "",
})
