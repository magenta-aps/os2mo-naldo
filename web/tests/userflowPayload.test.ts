import type { AddressInfo } from "$lib/stores/addressInfoStore"
import type { EmployeeInfo } from "$lib/stores/employeeInfoStore"
import type { EngagementInfo } from "$lib/stores/engagementInfoStore"
import type { ItuserInfo } from "$lib/stores/ituserInfoStore"
import type { ManagerInfo } from "$lib/stores/managerInfoStore"
import {
  buildUserflowPayload,
  isEmptyAddress,
  isEmptyEngagement,
  isEmptyItuser,
  isEmptyManager,
  reserveUserflowUuids,
  resetUserflowUuids,
  type UserflowStores,
} from "$lib/userflow/mappers"
import { beforeEach, describe, expect, it } from "vitest"

const employee = (patch: Partial<EmployeeInfo> = {}): EmployeeInfo => ({
  cprNumber: { name: "", cpr_no: "0101012345" },
  firstName: "Jacob",
  lastName: "Andersen",
  nicknameFirstname: "",
  nicknameLastname: "",
  validated: true,
  ...patch,
})

const engagement = (patch: Partial<EngagementInfo> = {}): EngagementInfo => ({
  fromDate: "2020-01-01",
  toDate: "",
  orgUnit: { uuid: "u1", name: "Unit" },
  user_key: "E1",
  jobFunction: { uuid: "j1", name: "Job" },
  engagementType: { uuid: "t1", name: "Type" },
  primary: undefined,
  extension1: "",
  extension4: "",
  validated: true,
  ...patch,
})

const ituser = (patch: Partial<ItuserInfo> = {}): ItuserInfo => ({
  fromDate: "2020-01-01",
  toDate: "",
  itSystem: { uuid: "s1", name: "AD" },
  user_key: "alice",
  externalId: "",
  notes: "",
  primary: undefined,
  rolebindings: [{ role: { uuid: "r1", name: "Role" } }],
  // The wizard never renders the engagement picker, so this stays unset.
  engagements: undefined,
  validated: true,
  ...patch,
})

const manager = (patch: Partial<ManagerInfo> = {}): ManagerInfo => ({
  fromDate: "2020-01-01",
  toDate: "",
  orgUnit: { uuid: "u1", name: "Unit" },
  managerType: { uuid: "mt1", name: "Type" },
  managerLevel: { uuid: "ml1", name: "Level" },
  responsibilities: [{ uuid: "r1", name: "A" }],
  validated: true,
  ...patch,
})

const address = (patch: Partial<AddressInfo> = {}): AddressInfo => ({
  fromDate: "2020-01-01",
  toDate: "",
  visibility: { uuid: "v1", name: "Public" },
  addressType: { uuid: "at1", name: "Email", scope: "EMAIL" },
  addressValue: { name: "", value: "a@b.dk" },
  user_key: "desc",
  validated: true,
  ...patch,
})

const stores = (patch: Partial<UserflowStores> = {}): UserflowStores => ({
  employee: employee(),
  engagements: [engagement()],
  itusers: [ituser()],
  managers: [],
  addresses: [],
  ...patch,
})

const sequentialUuids = () => {
  let counter = 0
  return () => `uuid-${counter++}`
}

describe("reserveUserflowUuids", () => {
  beforeEach(() => resetUserflowUuids())

  it("is stable across summary remounts within a run", () => {
    const gen = sequentialUuids()
    const first = reserveUserflowUuids(["a"], gen)
    const second = reserveUserflowUuids(["a"], gen)
    expect(second).toEqual(first)
  })

  it("keys ituser uuids by identity, so removals cannot re-pair them", () => {
    const gen = sequentialUuids()
    const first = reserveUserflowUuids(["a", "b"], gen)
    const afterRemoval = reserveUserflowUuids(["b"], gen)
    expect(afterRemoval.employee).toBe(first.employee)
    expect(afterRemoval.itusers[0]).toBe(first.itusers[1])
  })

  it("reserves uuids for new keys while keeping existing ones", () => {
    const gen = sequentialUuids()
    const first = reserveUserflowUuids(["a"], gen)
    const grown = reserveUserflowUuids(["a", "c"], gen)
    expect(grown.itusers[0]).toBe(first.itusers[0])
    expect(grown.itusers[1]).not.toBe(first.itusers[0])
  })

  it("resetUserflowUuids starts a fresh run", () => {
    const gen = sequentialUuids()
    const first = reserveUserflowUuids(["a"], gen)
    resetUserflowUuids()
    const next = reserveUserflowUuids(["a"], gen)
    expect(next.employee).not.toBe(first.employee)
  })
})

describe("buildUserflowPayload", () => {
  beforeEach(() => resetUserflowUuids())

  // The helper production uses, so the pairing under test is the real one.
  const uuidsFor = (ituserCount: number) =>
    reserveUserflowUuids(
      Array.from({ length: ituserCount }, (_, index) => `key-${index}`),
      sequentialUuids()
    )

  // Pins the whole mutation input, not a handful of keys: this is the contract
  // with MO, so a silently dropped or renamed key has to fail here.
  it("builds the exact mutation input for a fully filled wizard run", () => {
    const { payload, incomplete } = buildUserflowPayload(
      stores({
        employee: employee({
          cprNumber: { name: "", cpr_no: "010101-2345" },
          nicknameFirstname: "Jaap",
          nicknameLastname: "A.",
        }),
        engagements: [
          engagement({
            toDate: "2021-01-01",
            primary: { uuid: "p1", name: "Primary" },
            extension1: "007",
            extension4: "42",
          }),
        ],
        itusers: [
          ituser({
            notes: "a note",
            externalId: "X-1",
            primary: { uuid: "p1", name: "Primary" },
          }),
        ],
        managers: [manager()],
        addresses: [address()],
      }),
      uuidsFor(1)
    )

    expect(incomplete).toEqual([])
    expect(payload).toEqual({
      employeeInput: {
        uuid: "uuid-0",
        // Dashes are stripped before the CPR reaches MO.
        cpr_number: "0101012345",
        given_name: "Jacob",
        surname: "Andersen",
        nickname_given_name: "Jaap",
        nickname_surname: "A.",
      },
      engagementInput: [
        {
          person: "uuid-0",
          user_key: "E1",
          org_unit: "u1",
          engagement_type: "t1",
          job_function: "j1",
          primary: "p1",
          extension_1: "007",
          extension_4: "42",
          validity: { from: "2020-01-01", to: "2021-01-01" },
        },
      ],
      ituserInput: [
        {
          person: "uuid-0",
          uuid: "uuid-1",
          itsystem: "s1",
          user_key: "alice",
          note: "a note",
          external_id: "X-1",
          primary: "p1",
          validity: { from: "2020-01-01", to: null },
        },
      ],
      rolebindingInput: [
        {
          ituser: "uuid-1",
          role: "r1",
          validity: { from: "2020-01-01", to: null },
        },
      ],
      managerInput: [
        {
          person: "uuid-0",
          org_unit: "u1",
          manager_type: "mt1",
          manager_level: "ml1",
          responsibility: ["r1"],
          validity: { from: "2020-01-01", to: null },
        },
      ],
      addressInput: [
        {
          person: "uuid-0",
          address_type: "at1",
          value: "a@b.dk",
          user_key: "desc",
          visibility: "v1",
          validity: { from: "2020-01-01", to: null },
        },
      ],
    })
  })

  it("normalises empty toDate to null", () => {
    const { payload } = buildUserflowPayload(stores(), uuidsFor(1))
    expect(payload.engagementInput[0].validity.to).toBeNull()
  })

  it("excludes non-validated items from the payload", () => {
    const { payload } = buildUserflowPayload(
      stores({ engagements: [engagement({ validated: false })] }),
      uuidsFor(1)
    )
    expect(payload.engagementInput).toHaveLength(0)
  })

  // Incomplete = not validated, but not clean either — the factories fill every
  // field. Each entity pushes separately, so one dropped push goes unnoticed.
  it("reports a touched but unvalidated item of every entity as incomplete", () => {
    const { incomplete } = buildUserflowPayload(
      stores({
        engagements: [engagement({ validated: false })],
        itusers: [ituser({ validated: false })],
        managers: [manager({ validated: false })],
        addresses: [address({ validated: false })],
      }),
      uuidsFor(1)
    )
    expect(incomplete).toEqual([
      { entityKey: "engagement", index: 0 },
      { entityKey: "ituser", index: 0 },
      { entityKey: "manager", index: 0 },
      { entityKey: "address", index: 0 },
    ])
  })

  it("does not report a clean item as incomplete", () => {
    const { incomplete } = buildUserflowPayload(
      stores({
        engagements: [
          engagement({
            validated: undefined,
            orgUnit: undefined,
            jobFunction: undefined,
            engagementType: undefined,
            user_key: "",
          }),
        ],
      }),
      uuidsFor(1)
    )
    expect(incomplete).toEqual([])
  })

  it("only sends extension fields when set", () => {
    const { payload } = buildUserflowPayload(
      stores({ engagements: [engagement({ extension1: "007" })] }),
      uuidsFor(1)
    )
    expect(payload.engagementInput[0].extension_1).toBe("007")
    expect("extension_4" in payload.engagementInput[0]).toBe(false)
  })

  it("drops rolebinding rows with no role picked", () => {
    const { payload } = buildUserflowPayload(
      stores({
        itusers: [
          ituser({
            rolebindings: [{ role: { uuid: "r1", name: "Role" } }, { role: undefined }],
          }),
        ],
      }),
      uuidsFor(1)
    )
    expect(payload.rolebindingInput).toHaveLength(1)
    expect(payload.rolebindingInput[0].role).toBe("r1")
  })

  it("only sends the ituser external id when set", () => {
    const withId = buildUserflowPayload(
      stores({ itusers: [ituser({ externalId: "X-1" })] }),
      uuidsFor(1)
    ).payload
    expect(withId.ituserInput[0].external_id).toBe("X-1")
    const without = buildUserflowPayload(stores(), uuidsFor(1)).payload
    expect("external_id" in without.ituserInput[0]).toBe(false)
  })

  it("keeps ituser uuids index-aligned when an earlier ituser is skipped", () => {
    const { payload } = buildUserflowPayload(
      stores({ itusers: [ituser({ validated: false }), ituser()] }),
      uuidsFor(2)
    )
    expect(payload.ituserInput).toHaveLength(1)
    // The included ituser is at store index 1, so it gets the second uuid.
    expect(payload.ituserInput[0].uuid).toBe("uuid-2")
    expect(payload.rolebindingInput[0].ituser).toBe("uuid-2")
  })

  it("carries a key's uuid through a removal of an earlier ituser", () => {
    const gen = sequentialUuids()
    // First summary visit had two itusers; "a" was removed before this one.
    reserveUserflowUuids(["a", "b"], gen)
    const { payload } = buildUserflowPayload(
      stores({ itusers: [ituser()] }),
      reserveUserflowUuids(["b"], gen)
    )
    expect(payload.ituserInput[0].uuid).toBe("uuid-2")
    expect(payload.rolebindingInput[0].ituser).toBe("uuid-2")
  })

  // The exhaustive test above pins a manager with no end date and one
  // responsibility; this covers the other side of both.
  it("keeps a manager's end date and maps every responsibility", () => {
    const { payload } = buildUserflowPayload(
      stores({
        managers: [
          manager({
            toDate: "2021-01-01",
            responsibilities: [
              { uuid: "r1", name: "A" },
              { uuid: "r2", name: "B" },
            ],
          }),
        ],
      }),
      uuidsFor(1)
    )
    expect(payload.managerInput[0].responsibility).toEqual(["r1", "r2"])
    expect(payload.managerInput[0].validity.to).toBe("2021-01-01")
  })
})

describe("isEmpty helpers", () => {
  // Every field cleared, as a freshly added tab arrives.
  const cleanEngagement = {
    orgUnit: undefined,
    jobFunction: undefined,
    engagementType: undefined,
    user_key: "",
  }
  const cleanItuser = {
    itSystem: undefined,
    user_key: "",
    // A seeded role row with no role picked is still clean.
    rolebindings: [{ role: undefined }],
  }
  const cleanManager = {
    orgUnit: undefined,
    managerType: undefined,
    managerLevel: undefined,
    responsibilities: [],
  }
  const cleanAddress = {
    visibility: undefined,
    addressType: undefined,
    addressValue: { name: "", value: "" },
    user_key: "",
  }

  // One field filled in each, the minimum that should defeat emptiness.
  const touchedEngagement = { ...cleanEngagement, user_key: "E1" }
  const touchedItuser = { ...cleanItuser, user_key: "bob" }
  const touchedManager = {
    ...cleanManager,
    responsibilities: [{ uuid: "r1", name: "A" }],
  }
  const touchedAddress = {
    ...cleanAddress,
    addressValue: { name: "", value: "Main St 1" },
  }

  it("treats a clean item as empty and any touch as non-empty", () => {
    expect(isEmptyEngagement(engagement(cleanEngagement))).toBe(true)
    expect(isEmptyItuser(ituser(cleanItuser))).toBe(true)
    expect(isEmptyManager(manager(cleanManager))).toBe(true)
    expect(isEmptyAddress(address(cleanAddress))).toBe(true)

    expect(isEmptyEngagement(engagement(touchedEngagement))).toBe(false)
    expect(isEmptyItuser(ituser(touchedItuser))).toBe(false)
    expect(isEmptyManager(manager(touchedManager))).toBe(false)
    expect(isEmptyAddress(address(touchedAddress))).toBe(false)
  })

  // Only the start date is seeded, so an end date alone is a real edit.
  it("treats an end date alone as a touch", () => {
    const ended = { toDate: "2021-01-01" }
    expect(isEmptyEngagement(engagement({ ...cleanEngagement, ...ended }))).toBe(false)
    expect(isEmptyItuser(ituser({ ...cleanItuser, ...ended }))).toBe(false)
    expect(isEmptyManager(manager({ ...cleanManager, ...ended }))).toBe(false)
    expect(isEmptyAddress(address({ ...cleanAddress, ...ended }))).toBe(false)
  })
})
