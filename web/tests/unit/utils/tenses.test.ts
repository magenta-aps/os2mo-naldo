/**
 * Tests for tense-to-validity mapping utilities.
 *
 * The UI has a "past / present / future" toggle that filters table data.
 * These functions convert that toggle state into the date range parameters
 * expected by GraphQL queries. Two variants exist because GraphQL uses
 * camelCase (fromDate/toDate) but some filters use snake_case (from_date/to_date).
 */
import { describe, it, expect } from "vitest"
import { tenseToValidity, filterTenseToValidity } from "$lib/utils/tenses"

describe("tenseToValidity (camelCase keys for GraphQL variables)", () => {
  it("past: no lower bound, upper bound at current date", () => {
    expect(tenseToValidity("past", "2023-06-01")).toEqual({
      fromDate: null,
      toDate: "2023-06-01",
    })
  })

  it("present: lower bound at current date, no upper bound (shows active items)", () => {
    expect(tenseToValidity("present", "2023-06-01")).toEqual({
      fromDate: "2023-06-01",
    })
  })

  it("future: lower bound at current date, explicit null upper bound", () => {
    expect(tenseToValidity("future", "2023-06-01")).toEqual({
      fromDate: "2023-06-01",
      toDate: null,
    })
  })
})

describe("filterTenseToValidity (snake_case keys for filter parameters)", () => {
  it("past: from_date null, to_date set", () => {
    expect(filterTenseToValidity("past", "2023-06-01")).toEqual({
      from_date: null,
      to_date: "2023-06-01",
    })
  })

  it("present: from_date set, to_date omitted", () => {
    expect(filterTenseToValidity("present", "2023-06-01")).toEqual({
      from_date: "2023-06-01",
    })
  })

  it("future: from_date set, to_date explicitly null", () => {
    expect(filterTenseToValidity("future", "2023-06-01")).toEqual({
      from_date: "2023-06-01",
      to_date: null,
    })
  })
})
