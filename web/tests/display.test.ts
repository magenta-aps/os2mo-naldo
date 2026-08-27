import {
  getEngagementTitlesAndUuid,
  getITSystemNames,
  getITUserITSystemName,
  getManagerEngagementDisplay,
} from "$lib/utils/display"
import { describe, expect, it } from "vitest"

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

describe("getManagerEngagementDisplay", () => {
  const engagement = {
    extension_1: "Skoleleder",
    org_unit_response: { current: { name: "Haderslev skole" } },
    job_function_response: { current: { name: "Specialist", user_key: "SPEC" } },
  }

  it("shows plain job_function name and org unit when SD-code mode is off", () => {
    expect(getManagerEngagementDisplay(engagement, false, true)).toBe(
      "Specialist, Haderslev skole"
    )
  })

  it("shows extension_1 when SD-code mode and extension_1 are both on", () => {
    expect(getManagerEngagementDisplay(engagement, true, true)).toBe(
      "Skoleleder, Haderslev skole"
    )
  })

  it("falls back to the user_key - name composite when extension_1 is off", () => {
    expect(getManagerEngagementDisplay(engagement, true, false)).toBe(
      "SPEC - Specialist, Haderslev skole"
    )
  })

  it("falls back to the composite when extension_1 is on but unset", () => {
    const withoutExtension = { ...engagement, extension_1: null }
    expect(getManagerEngagementDisplay(withoutExtension, true, true)).toBe(
      "SPEC - Specialist, Haderslev skole"
    )
  })

  it("does not render 'undefined - undefined' when job_function_response is missing", () => {
    const withoutJobFunction = { ...engagement, job_function_response: undefined }
    expect(getManagerEngagementDisplay(withoutJobFunction, true, false)).toBe(
      "undefined, Haderslev skole"
    )
  })
})
