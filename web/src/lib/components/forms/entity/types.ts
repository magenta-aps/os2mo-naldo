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
  // Only used with `anchor="org-unit"` (creating from an org unit's page,
  // where the person is picked and the unit comes from the route).
  person: { uuid: string; name: string } | undefined
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
  person: undefined,
  user_key: "",
  jobFunction: undefined,
  engagementType: undefined,
  primary: undefined,
  extension1: "",
  extension4: "",
})

// Seeds the field group from an existing engagement for the edit forms. The
// start date deliberately stays the current viewing date: an edit applies
// from that date, not from the row's original start.
// A related object whose name does not resolve at the row's date falls back
// to its uuid: the Select component clears a value whose name is empty, which
// would silently drop a perfectly valid selection.
const toSelected = (response: any) =>
  response
    ? { uuid: response.uuid, name: response.current?.name ?? response.uuid }
    : undefined

export const engagementToValues = (e: any): EngagementValues => ({
  fromDate: get(date),
  toDate: e.validity?.to?.split("T")[0] ?? "",
  orgUnit: toSelected(e.org_unit_response),
  person: undefined,
  user_key: e.user_key ?? "",
  jobFunction: toSelected(e.job_function_response),
  engagementType: toSelected(e.engagement_type_response),
  primary: toSelected(e.primary_response),
  extension1: e.extension_1 ?? "",
  extension4: e.extension_4 ?? "",
})

// Change detection for the edit forms. Any editable field differing counts as
// a change; the end date only counts when cleared, first set, or extended —
// the shortening case belongs to the terminate flow.
export const engagementValuesChanged = (
  current: EngagementValues,
  initial: EngagementValues
): boolean => {
  const editableChanged =
    current.orgUnit?.uuid !== initial.orgUnit?.uuid ||
    current.jobFunction?.uuid !== initial.jobFunction?.uuid ||
    current.engagementType?.uuid !== initial.engagementType?.uuid ||
    current.primary?.uuid !== initial.primary?.uuid ||
    current.user_key !== initial.user_key ||
    current.extension1 !== initial.extension1 ||
    current.extension4 !== initial.extension4
  const toDateExtended =
    current.toDate === "" ? initial.toDate !== "" : current.toDate > initial.toDate
  return editableChanged || toDateExtended
}

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

export type ManagerValues = {
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  managerType: ClassValue | undefined
  managerLevel: ClassValue | undefined
  responsibilities: ClassValue[]
}

export const createDefaultManagerValues = (): ManagerValues => ({
  fromDate: get(date),
  toDate: "",
  orgUnit: undefined,
  managerType: undefined,
  managerLevel: undefined,
  responsibilities: [],
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
