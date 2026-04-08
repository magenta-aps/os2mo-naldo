/**
 * Tests for display formatting utilities.
 *
 * These functions transform GraphQL data into display-friendly strings
 * used in dropdowns, table cells, and search results.
 */
import { describe, it, expect } from "vitest"
import {
  getITUserITSystemName,
  getEngagementTitlesAndUuid,
  getITSystemNames,
} from "$lib/utils/display"

describe("getITUserITSystemName", () => {
  it("combines itsystem name and user_key into 'AD, bruce' format for dropdown display", () => {
    const result = getITUserITSystemName([
      { uuid: "ituser-1", user_key: "bruce", itsystem: { name: "AD", uuid: "is-1" } },
      {
        uuid: "ituser-2",
        user_key: "katrine",
        itsystem: { name: "SAP", uuid: "is-2" },
      },
    ])
    expect(result).toEqual([
      { uuid: "ituser-1", name: "AD, bruce", itsystem: { uuid: "is-1" } },
      { uuid: "ituser-2", name: "SAP, katrine", itsystem: { uuid: "is-2" } },
    ])
  })
})

describe("getEngagementTitlesAndUuid", () => {
  it("combines job function and org unit into 'Specialist, Haderslev skole' format", () => {
    const result = getEngagementTitlesAndUuid([
      {
        uuid: "eng-1",
        job_function: { name: "Specialist" },
        org_unit: [{ name: "Haderslev skole" }],
      },
      {
        uuid: "eng-2",
        job_function: { name: "Timelønnet lærer" },
        org_unit: [{ name: "Sjølund skole" }],
      },
    ])
    expect(result).toEqual([
      { uuid: "eng-1", name: "Specialist, Haderslev skole" },
      { uuid: "eng-2", name: "Timelønnet lærer, Sjølund skole" },
    ])
  })
})

describe("getITSystemNames", () => {
  it("filters out systems with null current, returns sorted by name alphabetically", () => {
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
