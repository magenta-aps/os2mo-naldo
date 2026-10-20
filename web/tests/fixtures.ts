import { jsonSerializer } from "$lib/http/dateTimes"
import type { AddressInfo } from "$lib/stores/addressInfoStore"
import type { EmployeeInfo } from "$lib/stores/employeeInfoStore"
import type { EngagementInfo } from "$lib/stores/engagementInfoStore"
import type { ItuserInfo } from "$lib/stores/ituserInfoStore"
import type { ManagerInfo } from "$lib/stores/managerInfoStore"
import { moValidityFrom, startOfDay } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"

export const day = (s: string) => Temporal.PlainDate.from(s)

// Midnight in Copenhagen, the way MO sends validity bounds.
export const midnight = (s: string) => startOfDay(day(s))

// A validity as GraphQL v29 returns it: `to` is exclusive, so a validity whose
// last valid day is 2020-01-01 has `to` 2020-01-02.
export const validity = (from: string, to: string | null) => ({
  from: midnight(from),
  to: to ? midnight(to) : null,
})

// An object carrying a validity.
export const dated = (from: string, to: string | null) => ({
  validity: validity(from, to),
})

// A value as it is sent to MO, with its timestamps written out.
export const sent = (value: unknown) => JSON.parse(jsonSerializer.stringify(value))

// Wizard steps filled in and validated.
export const employee = (patch: Partial<EmployeeInfo> = {}): EmployeeInfo => ({
  cprNumber: { name: "", cpr_no: "0101012345" },
  firstName: "Jacob",
  lastName: "Andersen",
  nicknameFirstname: "",
  nicknameLastname: "",
  validated: true,
  ...patch,
})

export const engagement = (patch: Partial<EngagementInfo> = {}): EngagementInfo => ({
  fromDate: moValidityFrom(day("2020-01-01")),
  toDate: undefined,
  orgUnit: { uuid: "u1", name: "Unit" },
  user_key: "E1",
  jobFunction: { uuid: "j1", name: "Job" },
  engagementType: { uuid: "t1", name: "Type" },
  primary: undefined,
  explicitManagerPerson: undefined,
  explicitManager: undefined,
  extension1: "",
  extension4: "",
  validated: true,
  ...patch,
})

export const ituser = (patch: Partial<ItuserInfo> = {}): ItuserInfo => ({
  fromDate: moValidityFrom(day("2020-01-01")),
  toDate: undefined,
  itSystem: { uuid: "s1", name: "AD" },
  user_key: "alice",
  externalId: "",
  notes: "",
  primary: undefined,
  rolebindings: [{ role: { uuid: "r1", name: "Role" } }],
  validated: true,
  ...patch,
})

export const manager = (patch: Partial<ManagerInfo> = {}): ManagerInfo => ({
  fromDate: moValidityFrom(day("2020-01-01")),
  toDate: undefined,
  orgUnit: { uuid: "u1", name: "Unit" },
  managerType: { uuid: "mt1", name: "Type" },
  managerLevel: { uuid: "ml1", name: "Level" },
  responsibilities: [{ uuid: "r1", name: "A" }],
  primary: undefined,
  validated: true,
  ...patch,
})

export const address = (patch: Partial<AddressInfo> = {}): AddressInfo => ({
  fromDate: moValidityFrom(day("2020-01-01")),
  toDate: undefined,
  visibility: { uuid: "v1", name: "Public" },
  addressType: { uuid: "at1", name: "Email", scope: "EMAIL" },
  addressValue: { name: "", value: "a@b.dk" },
  user_key: "desc",
  validated: true,
  ...patch,
})
