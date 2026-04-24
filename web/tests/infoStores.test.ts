import { describe, it, expect } from "vitest"
import { validateAddress, type AddressInfo } from "$lib/stores/addressInfoStore"
import { validateEmployee, type EmployeeInfo } from "$lib/stores/employeeInfoStore"
import {
  validateEngagement,
  type EngagementInfo,
} from "$lib/stores/engagementInfoStore"
import { validateItuser, type ItuserInfo } from "$lib/stores/ituserInfoStore"
import { validateManager, type ManagerInfo } from "$lib/stores/managerInfoStore"

// The validate* functions in the InfoStore modules are pure: they take a
// plain info object and return a bool. Each has its own "required fields"
// contract. Pin the contract per store.

describe("validateAddress", () => {
  const valid = {
    fromDate: "2020-01-01",
    addressType: { uuid: "t1" },
    addressValue: { value: "Main St" },
  } as unknown as AddressInfo

  it("accepts a complete address", () => {
    expect(validateAddress(valid)).toBe(true)
  })

  it("rejects without fromDate", () => {
    expect(validateAddress({ ...valid, fromDate: "" })).toBe(false)
  })

  it("rejects without addressType.uuid", () => {
    expect(
      validateAddress({ ...valid, addressType: { uuid: "" } } as AddressInfo)
    ).toBe(false)
  })

  it("rejects without addressValue.value", () => {
    expect(
      validateAddress({
        ...valid,
        addressValue: { value: "" },
      } as AddressInfo)
    ).toBe(false)
  })
})

describe("validateEmployee", () => {
  const valid = {
    firstName: "Jacob",
    lastName: "Andersen",
    cprNumber: { cpr_no: "0101012345" },
  } as unknown as EmployeeInfo

  it("accepts a complete employee", () => {
    expect(validateEmployee(valid)).toBe(true)
  })

  it("rejects without firstName", () => {
    expect(validateEmployee({ ...valid, firstName: "" })).toBe(false)
  })

  it("rejects without lastName", () => {
    expect(validateEmployee({ ...valid, lastName: "" })).toBe(false)
  })

  it("rejects when CPR is missing", () => {
    expect(validateEmployee({ ...valid, cprNumber: undefined } as any)).toBe(false)
  })

  it("rejects when CPR is not exactly 10 digits", () => {
    expect(validateEmployee({ ...valid, cprNumber: { cpr_no: "12345" } } as any)).toBe(
      false
    )
    expect(
      validateEmployee({ ...valid, cprNumber: { cpr_no: "123456789a" } } as any)
    ).toBe(false)
  })
})

describe("validateEngagement", () => {
  const valid = {
    fromDate: "2020-01-01",
    orgUnit: { uuid: "u1" },
    jobFunction: { uuid: "j1" },
    engagementType: { uuid: "e1" },
  } as unknown as EngagementInfo

  it("accepts a complete engagement", () => {
    expect(validateEngagement(valid)).toBe(true)
  })

  it.each([
    ["fromDate", { fromDate: "" }],
    ["orgUnit.uuid", { orgUnit: { uuid: "" } }],
    ["jobFunction.uuid", { jobFunction: { uuid: "" } }],
    ["engagementType.uuid", { engagementType: { uuid: "" } }],
  ])("rejects when %s is missing", (_label, patch) => {
    expect(validateEngagement({ ...valid, ...patch } as EngagementInfo)).toBe(false)
  })
})

describe("validateItuser", () => {
  const valid = {
    fromDate: "2020-01-01",
    itSystem: { uuid: "s1" },
    userkey: "alice",
  } as unknown as ItuserInfo

  it("accepts a complete ituser", () => {
    expect(validateItuser(valid)).toBe(true)
  })

  it("rejects without fromDate", () => {
    expect(validateItuser({ ...valid, fromDate: "" })).toBe(false)
  })

  it("rejects without itSystem.uuid", () => {
    expect(validateItuser({ ...valid, itSystem: { uuid: "" } } as ItuserInfo)).toBe(
      false
    )
  })

  it("rejects without userkey", () => {
    expect(validateItuser({ ...valid, userkey: "" })).toBe(false)
  })
})

describe("validateManager", () => {
  const valid = {
    fromDate: "2020-01-01",
    orgUnit: { uuid: "u1" },
    managerType: { uuid: "t1" },
    managerLevel: { uuid: "l1" },
    responsibilities: [{ uuid: "r1" }],
  } as unknown as ManagerInfo

  it("accepts a complete manager", () => {
    expect(validateManager(valid)).toBe(true)
  })

  it.each([
    ["fromDate", { fromDate: "" }],
    ["orgUnit.uuid", { orgUnit: { uuid: "" } }],
    ["managerType.uuid", { managerType: { uuid: "" } }],
    ["managerLevel.uuid", { managerLevel: { uuid: "" } }],
    ["responsibilities is empty", { responsibilities: [] }],
  ])("rejects when %s", (_label, patch) => {
    expect(validateManager({ ...valid, ...patch } as ManagerInfo)).toBe(false)
  })
})
