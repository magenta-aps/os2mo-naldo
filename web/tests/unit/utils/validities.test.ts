/**
 * Tests for validity date utilities.
 *
 * These functions handle date ranges (validities) from the GraphQL API:
 * - getMinMaxValidities: finds the overall date range across multiple validities
 *   (used to set datepicker bounds in edit forms)
 * - formatQueryDates: converts a validity into URL query params for edit links
 * - findClosestValidity: picks the most relevant validity for a given date
 *   (used when an object has multiple validities and we need to show one)
 */
import { describe, it, expect } from "vitest"
import {
  getMinMaxValidities,
  formatQueryDates,
  findClosestValidity,
} from "$lib/utils/validities"

describe("getMinMaxValidities", () => {
  it("returns the earliest 'from' and latest 'to' across all validities", () => {
    const result = getMinMaxValidities([
      { validity: { from: "2021-06-01T00:00:00", to: "2022-01-01T00:00:00" } },
      { validity: { from: "2020-01-01T00:00:00", to: "2023-12-31T00:00:00" } },
      { validity: { from: "2022-03-15T00:00:00", to: "2022-06-01T00:00:00" } },
    ])
    expect(result).toEqual({ from: "2020-01-01", to: "2023-12-31" })
  })

  it("returns undefined 'to' when any validity is open-ended (no end date)", () => {
    const result = getMinMaxValidities([
      { validity: { from: "2021-01-01T00:00:00", to: "2022-01-01T00:00:00" } },
      { validity: { from: "2020-01-01T00:00:00", to: null } },
    ])
    expect(result).toEqual({ from: "2020-01-01", to: undefined })
  })

  it("returns both undefined for null input (e.g. when creating new objects without a uuid)", () => {
    expect(getMinMaxValidities(null)).toEqual({ from: undefined, to: undefined })
  })

  it("returns both undefined for undefined input", () => {
    expect(getMinMaxValidities(undefined)).toEqual({ from: undefined, to: undefined })
  })
})

describe("formatQueryDates", () => {
  it("produces '?from=...&to=...' query string from a validity with both dates", () => {
    const result = formatQueryDates({
      from: "2021-01-01T00:00:00+01:00",
      to: "2023-03-03T00:00:00+01:00",
    })
    expect(result).toContain("from=")
    expect(result).toContain("to=")
    expect(result).toMatch(/^\?from=.*&to=/)
  })

  it("omits 'to' param when 'to' date is empty (open-ended validity)", () => {
    const result = formatQueryDates({
      from: "2021-01-01T00:00:00+01:00",
      to: "",
    })
    expect(result).toContain("from=")
    expect(result).not.toContain("to=")
  })

  it("returns empty string when both dates are invalid", () => {
    const result = formatQueryDates({ from: "", to: "" })
    expect(result).toBe("")
  })
})

describe("findClosestValidity", () => {
  // Three non-overlapping validities with gaps between them
  const validities = [
    { validity: { from: "2020-01-01T00:00:00", to: "2020-12-31T00:00:00" }, name: "A" },
    { validity: { from: "2021-06-01T00:00:00", to: "2022-06-01T00:00:00" }, name: "B" },
    { validity: { from: "2023-01-01T00:00:00", to: "2024-01-01T00:00:00" }, name: "C" },
  ]

  it("returns the validity that is active on the given date", () => {
    const result = findClosestValidity(validities, "2021-09-01")
    expect(result.name).toBe("B")
  })

  it("returns the nearest validity when date falls in a gap between validities", () => {
    // 2021-03-01 is between A (ends Dec 2020) and B (starts Jun 2021)
    const result = findClosestValidity(validities, "2021-03-01")
    expect(["A", "B"]).toContain(result.name)
  })

  it("returns the only validity immediately when array has one element", () => {
    const result = findClosestValidity([validities[0]], "2025-01-01")
    expect(result.name).toBe("A")
  })

  it("returns the last validity when date is after all validities have ended", () => {
    const result = findClosestValidity(validities, "2025-01-01")
    expect(result.name).toBe("C")
  })
})
