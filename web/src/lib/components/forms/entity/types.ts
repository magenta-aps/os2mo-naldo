// Value shapes for the shared per-entity field groups. Both consumers bind
// one of these as the group's `value`:
//   - the create routes seed a local `createDefaultXValues()` object
//   - the userflow wizard binds a store item (same shape + wizard-only extras)
// Keeping the shapes here, next to the field groups, is what stops the two
// consumers from drifting apart again.

import { get } from "svelte/store"
import { date } from "$lib/stores/date"

// Class selections mirror the shared Select's Value shape exactly (uuid is
// nullable there); GraphQL calls the third field user_key, so we do too (this
// also settles the old userkey/user_key drift between the wizard stores).
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

export type RolebindingValues = {
  // `ituser dates == rolebinding dates` on creation, so rolebindings carry no
  // dates of their own here.
  role: ClassValue | undefined
}

export const createDefaultRolebindingValues = (): RolebindingValues => ({
  role: undefined,
})

export type ItuserValues = {
  fromDate: string
  toDate: string
  itSystem: ClassValue | undefined
  // The account name.
  user_key: string
  externalId: string
  notes: string
  primary: ClassValue | undefined
  rolebindings: RolebindingValues[]
}

export const createDefaultItuserValues = (): ItuserValues => ({
  fromDate: get(date),
  toDate: "",
  itSystem: undefined,
  user_key: "",
  externalId: "",
  notes: "",
  primary: undefined,
  rolebindings: [createDefaultRolebindingValues()],
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
