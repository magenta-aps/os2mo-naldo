import { describe, it, expect } from "vitest"
import {
  getITUserITSystemName,
  getEngagementTitlesAndUuid,
  getITSystemNames,
} from "$lib/utils/display"

describe("getITUserITSystemName", () => {
  it("formats itsystem name and user_key", () => {
    const result = getITUserITSystemName([
      {
        uuid: "ituser-1",
        user_key: "bruce",
        itsystem_response: { uuid: "is-1", current: { name: "AD" } },
      },
      {
        uuid: "ituser-2",
        user_key: "katrine",
        itsystem_response: { uuid: "is-2", current: { name: "SAP" } },
      },
    ])
    expect(result).toEqual([
      { uuid: "ituser-1", name: "AD, bruce", itsystem: { uuid: "is-1" } },
      { uuid: "ituser-2", name: "SAP, katrine", itsystem: { uuid: "is-2" } },
    ])
  })
})

describe("getEngagementTitlesAndUuid", () => {
  it("formats job function and org unit names", () => {
    const result = getEngagementTitlesAndUuid([
      {
        uuid: "eng-1",
        job_function_response: { current: { name: "Specialist" } },
        org_unit_response: { current: { name: "Haderslev skole" } },
      },
      {
        uuid: "eng-2",
        job_function_response: { current: { name: "Timelønnet lærer" } },
        org_unit_response: { current: { name: "Sjølund skole" } },
      },
    ])
    expect(result).toEqual([
      { uuid: "eng-1", name: "Specialist, Haderslev skole" },
      { uuid: "eng-2", name: "Timelønnet lærer, Sjølund skole" },
    ])
  })
})

describe("getITSystemNames", () => {
  it("filters null and sorts by name", () => {
    const result = getITSystemNames([
      { current: { uuid: "b", name: "SAP" } },
      { current: null },
      { current: { uuid: "a", name: "Active Directory" } },
    ])
    expect(result).toEqual([
      { uuid: "a", name: "Active Directory" },
      { uuid: "b", name: "SAP" },
    ])
  })
})
