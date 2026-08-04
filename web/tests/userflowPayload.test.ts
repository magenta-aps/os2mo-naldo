import type { EmployeeInfo } from "$lib/stores/employeeInfoStore"
import type { EngagementInfo } from "$lib/stores/engagementInfoStore"
import type { ItuserInfo } from "$lib/stores/ituserInfoStore"
import {
  buildUserflowPayload,
  getUserflowUuids,
  isEmptyAddress,
  isEmptyEngagement,
  isEmptyItuser,
  isEmptyManager,
  mintUserflowUuids,
  resetUserflowUuids,
  type UserflowStores,
} from "$lib/userflow/mappers"
import { beforeEach, describe, expect, it } from "vitest"

const employee: EmployeeInfo = {
  cprNumber: { name: "", cpr_no: "0101012345" },
  firstName: "Jacob",
  lastName: "Andersen",
  nicknameFirstname: "",
  nicknameLastname: "",
  validated: true,
}

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
  rolebindings: [{ role: { uuid: "r1", name: "Role" } }, { role: undefined }],
  validated: true,
  ...patch,
})

const stores = (patch: Partial<UserflowStores> = {}): UserflowStores => ({
  employee,
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

describe("mintUserflowUuids", () => {
  it("mints one employee uuid and one per ituser", () => {
    const uuids = mintUserflowUuids(2, sequentialUuids())
    expect(uuids).toEqual({ employee: "uuid-0", itusers: ["uuid-1", "uuid-2"] })
  })

  it("mints fresh uuids per call", () => {
    const first = mintUserflowUuids(1)
    const second = mintUserflowUuids(1)
    expect(first.employee).not.toBe(second.employee)
    expect(first.itusers[0]).not.toBe(second.itusers[0])
  })
})

describe("getUserflowUuids", () => {
  beforeEach(() => resetUserflowUuids())

  it("is stable across summary remounts within a run", () => {
    const gen = sequentialUuids()
    const first = getUserflowUuids(["a"], gen)
    const second = getUserflowUuids(["a"], gen)
    expect(second).toEqual(first)
  })

  it("keys ituser uuids by identity, so removals cannot re-pair them", () => {
    const gen = sequentialUuids()
    const first = getUserflowUuids(["a", "b"], gen)
    // Item "a" removed between summary visits: "b" keeps its uuid.
    const afterRemoval = getUserflowUuids(["b"], gen)
    expect(afterRemoval.employee).toBe(first.employee)
    expect(afterRemoval.itusers[0]).toBe(first.itusers[1])
  })

  it("mints for new keys while keeping existing ones", () => {
    const gen = sequentialUuids()
    const first = getUserflowUuids(["a"], gen)
    const grown = getUserflowUuids(["a", "c"], gen)
    expect(grown.itusers[0]).toBe(first.itusers[0])
    expect(grown.itusers[1]).not.toBe(first.itusers[0])
  })

  it("resetUserflowUuids starts a fresh run", () => {
    const gen = sequentialUuids()
    const first = getUserflowUuids(["a"], gen)
    resetUserflowUuids()
    const next = getUserflowUuids(["a"], gen)
    expect(next.employee).not.toBe(first.employee)
  })
})

describe("buildUserflowPayload", () => {
  const uuids = mintUserflowUuids(1, sequentialUuids())

  // Pins the whole mutation input, not a handful of keys: this is the contract
  // with MO, so a silently dropped or renamed key has to fail here.
  it("builds the exact mutation input for a fully filled wizard run", () => {
    const { payload, skipped } = buildUserflowPayload(
      stores({
        employee: {
          cprNumber: { name: "", cpr_no: "010101-2345" },
          firstName: "Jacob",
          lastName: "Andersen",
          nicknameFirstname: "Jaap",
          nicknameLastname: "A.",
          validated: true,
        },
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
        managers: [
          {
            fromDate: "2020-01-01",
            toDate: "",
            orgUnit: { uuid: "u1", name: "Unit" },
            managerType: { uuid: "mt1", name: "Type" },
            managerLevel: { uuid: "ml1", name: "Level" },
            responsibilities: [{ uuid: "r1", name: "A" }],
            validated: true,
          },
        ],
        addresses: [
          {
            fromDate: "2020-01-01",
            toDate: "",
            visibility: { uuid: "v1", name: "Public" },
            addressType: { uuid: "at1", name: "Email", scope: "EMAIL" },
            addressValue: { name: "", value: "a@b.dk" },
            user_key: "desc",
            validated: true,
          },
        ],
      }),
      mintUserflowUuids(1, sequentialUuids())
    )

    expect(skipped).toEqual([])
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

  it("links children to the minted employee uuid", () => {
    const { payload } = buildUserflowPayload(stores(), uuids)
    expect(payload.employeeInput.uuid).toBe("uuid-0")
    expect(payload.engagementInput[0].person).toBe("uuid-0")
    expect(payload.ituserInput[0].person).toBe("uuid-0")
  })

  it("links rolebindings to their parent ituser's minted uuid and drops empty roles", () => {
    const { payload } = buildUserflowPayload(stores(), uuids)
    expect(payload.ituserInput[0].uuid).toBe("uuid-1")
    expect(payload.rolebindingInput).toHaveLength(1)
    expect(payload.rolebindingInput[0].ituser).toBe("uuid-1")
    expect(payload.rolebindingInput[0].role).toBe("r1")
  })

  it("normalises empty toDate to null", () => {
    const { payload } = buildUserflowPayload(stores(), uuids)
    expect(payload.engagementInput[0].validity.to).toBeNull()
  })

  it("excludes non-validated items from the payload", () => {
    const { payload } = buildUserflowPayload(
      stores({ engagements: [engagement({ validated: false })] }),
      uuids
    )
    expect(payload.engagementInput).toHaveLength(0)
  })

  it("reports non-empty invalid items as skipped, but not pristine ones", () => {
    const touched = engagement({ validated: false, engagementType: undefined })
    const pristine = engagement({
      validated: undefined,
      orgUnit: undefined,
      jobFunction: undefined,
      engagementType: undefined,
      user_key: "",
    })
    const { skipped } = buildUserflowPayload(
      stores({ engagements: [touched, pristine] }),
      uuids
    )
    expect(skipped).toEqual([{ entityKey: "engagement", index: 0 }])
  })

  it("only sends extension fields when set", () => {
    const { payload } = buildUserflowPayload(
      stores({ engagements: [engagement({ extension1: "007" })] }),
      uuids
    )
    expect(payload.engagementInput[0].extension_1).toBe("007")
    expect("extension_4" in payload.engagementInput[0]).toBe(false)
  })

  it("only sends the ituser external id when set", () => {
    const withId = buildUserflowPayload(
      stores({ itusers: [ituser({ externalId: "X-1" })] }),
      mintUserflowUuids(1, sequentialUuids())
    ).payload
    expect(withId.ituserInput[0].external_id).toBe("X-1")
    const without = buildUserflowPayload(stores(), mintUserflowUuids(1)).payload
    expect("external_id" in without.ituserInput[0]).toBe(false)
  })

  it("keeps ituser uuids index-aligned when an earlier ituser is skipped", () => {
    const { payload } = buildUserflowPayload(
      stores({ itusers: [ituser({ validated: false }), ituser()] }),
      mintUserflowUuids(2, sequentialUuids())
    )
    expect(payload.ituserInput).toHaveLength(1)
    // The included ituser is at store index 1, so it gets the second uuid.
    expect(payload.ituserInput[0].uuid).toBe("uuid-2")
    expect(payload.rolebindingInput[0].ituser).toBe("uuid-2")
  })

  it("maps validated managers and addresses onto the minted employee", () => {
    const { payload } = buildUserflowPayload(
      stores({
        managers: [
          {
            fromDate: "2020-01-01",
            toDate: "2021-01-01",
            orgUnit: { uuid: "u1", name: "Unit" },
            managerType: { uuid: "mt1", name: "Type" },
            managerLevel: { uuid: "ml1", name: "Level" },
            responsibilities: [
              { uuid: "r1", name: "A" },
              { uuid: "r2", name: "B" },
            ],
            validated: true,
          },
        ],
        addresses: [
          {
            fromDate: "2020-01-01",
            toDate: "",
            visibility: { uuid: "v1", name: "Public" },
            addressType: { uuid: "at1", name: "Email", scope: "EMAIL" },
            addressValue: { name: "", value: "a@b.dk" },
            user_key: "desc",
            validated: true,
          },
        ],
      }),
      mintUserflowUuids(1, sequentialUuids())
    )
    expect(payload.managerInput[0].person).toBe("uuid-0")
    expect(payload.managerInput[0].responsibility).toEqual(["r1", "r2"])
    expect(payload.managerInput[0].validity.to).toBe("2021-01-01")
    expect(payload.addressInput[0].person).toBe("uuid-0")
    expect(payload.addressInput[0].value).toBe("a@b.dk")
    expect(payload.addressInput[0].validity.to).toBeNull()
  })
})

describe("isEmpty helpers", () => {
  it("treats a pristine engagement as empty and any touch as non-empty", () => {
    expect(
      isEmptyEngagement(
        engagement({
          orgUnit: undefined,
          jobFunction: undefined,
          engagementType: undefined,
          user_key: "",
        })
      )
    ).toBe(true)
    expect(isEmptyEngagement(engagement({ user_key: "x" }))).toBe(false)
  })

  it("treats a pristine ituser as empty (role rows without roles count as empty)", () => {
    expect(
      isEmptyItuser(
        ituser({
          itSystem: undefined,
          user_key: "",
          rolebindings: [{ role: undefined }],
        })
      )
    ).toBe(true)
    expect(isEmptyItuser(ituser({ itSystem: undefined, user_key: "bob" }))).toBe(false)
  })

  it("manager and address emptiness track their selections", () => {
    expect(
      isEmptyManager({
        fromDate: "2020-01-01",
        toDate: "",
        orgUnit: undefined,
        managerType: undefined,
        managerLevel: undefined,
        responsibilities: [],
      })
    ).toBe(true)
    expect(
      isEmptyAddress({
        fromDate: "2020-01-01",
        toDate: "",
        visibility: undefined,
        addressType: undefined,
        addressValue: { name: "", value: "" },
        user_key: "",
      })
    ).toBe(true)
    expect(
      isEmptyAddress({
        fromDate: "2020-01-01",
        toDate: "",
        visibility: undefined,
        addressType: undefined,
        addressValue: { name: "", value: "Main St 1" },
        user_key: "",
      })
    ).toBe(false)
  })
})
