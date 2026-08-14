import {
  filterEmployeesWithRelations,
  sortSearchResultsByName,
  visiblePhoneNumbers,
} from "$lib/components/orgviewer/search/search"
import { describe, expect, it } from "vitest"

describe("visiblePhoneNumbers", () => {
  it("includes addresses with no visibility set", () => {
    expect(visiblePhoneNumbers([{ name: "12345678", visibility: null }])).toEqual([
      "12345678",
    ])
  })

  it("includes INTERNAL and PUBLIC scoped addresses", () => {
    const addresses = [
      { name: "a", visibility: { scope: "INTERNAL" } },
      { name: "b", visibility: { scope: "PUBLIC" } },
    ]
    expect(visiblePhoneNumbers(addresses)).toEqual(["a", "b"])
  })

  it("excludes addresses with any other visibility scope (e.g. SECRET)", () => {
    const addresses = [{ name: "hidden", visibility: { scope: "SECRET" } }]
    expect(visiblePhoneNumbers(addresses)).toEqual([])
  })

  it("skips addresses with no name even if visible", () => {
    expect(visiblePhoneNumbers([{ name: null, visibility: null }])).toEqual([])
  })
})

describe("filterEmployeesWithRelations", () => {
  it("keeps employees with at least one engagement", () => {
    const employees = [{ engagements: [{ uuid: "e1" }], associations: [] }]
    expect(filterEmployeesWithRelations(employees)).toHaveLength(1)
  })

  it("keeps employees with at least one association", () => {
    const employees = [{ engagements: [], associations: [{ uuid: "a1" }] }]
    expect(filterEmployeesWithRelations(employees)).toHaveLength(1)
  })

  it("drops employees with neither", () => {
    const employees = [{ engagements: [], associations: [] }]
    expect(filterEmployeesWithRelations(employees)).toHaveLength(0)
  })

  it("treats missing fields (not fetched, e.g. relation type excludes them) as empty", () => {
    const employees = [{}]
    expect(filterEmployeesWithRelations(employees)).toHaveLength(0)
  })
})

describe("sortSearchResultsByName", () => {
  it("sorts alphabetically via localeCompare", () => {
    const results = [{ name: "Charlie" }, { name: "alice" }, { name: "Bob" }]
    expect(sortSearchResultsByName(results).map((r) => r.name)).toEqual([
      "alice",
      "Bob",
      "Charlie",
    ])
  })

  it("does not mutate the input array", () => {
    const results = [{ name: "b" }, { name: "a" }]
    const original = [...results]
    sortSearchResultsByName(results)
    expect(results).toEqual(original)
  })
})
