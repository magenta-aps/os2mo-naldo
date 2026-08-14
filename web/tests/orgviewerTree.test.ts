import {
  computePersonCounts,
  filterHiddenOrgUnits,
  sortSiblings,
  type OrgViewerUnit,
} from "$lib/components/orgviewer/tree/orgViewerTree"
import { describe, expect, it } from "vitest"

const unit = (overrides: Partial<OrgViewerUnit>): OrgViewerUnit => ({
  uuid: "uuid",
  name: "name",
  user_key: "user_key",
  has_children: false,
  child_count: 0,
  associations: [],
  engagements: [],
  ...overrides,
})

describe("filterHiddenOrgUnits", () => {
  const units = [
    unit({ uuid: "a", name: "Alpha", org_unit_level: { uuid: "level-1" } }),
    unit({ uuid: "b", name: "Beta (afdeling)", org_unit_level: { uuid: "level-2" } }),
    unit({ uuid: "c", name: "Gamma" }),
  ]

  it("passes everything through when no filters are configured", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: [],
      hideNameSubstrings: [],
      hideLevelUuids: [],
    })
    expect(result.map((u) => u.uuid)).toEqual(["a", "b", "c"])
  })

  it("filters by explicit uuid", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: ["b"],
      hideNameSubstrings: [],
      hideLevelUuids: [],
    })
    expect(result.map((u) => u.uuid)).toEqual(["a", "c"])
  })

  it("filters by name substring", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: [],
      hideNameSubstrings: ["afdeling"],
      hideLevelUuids: [],
    })
    expect(result.map((u) => u.uuid)).toEqual(["a", "c"])
  })

  it("filters by org_unit_level uuid", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: [],
      hideNameSubstrings: [],
      hideLevelUuids: ["level-1"],
    })
    expect(result.map((u) => u.uuid)).toEqual(["b", "c"])
  })

  it("does not filter out units with no org_unit_level when hideLevelUuids is set", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: [],
      hideNameSubstrings: [],
      hideLevelUuids: ["level-2"],
    })
    expect(result.map((u) => u.uuid)).toEqual(["a", "c"])
  })

  it("applies all three filters together", () => {
    const result = filterHiddenOrgUnits(units, {
      hideUuids: ["c"],
      hideNameSubstrings: ["afdeling"],
      hideLevelUuids: ["level-1"],
    })
    expect(result).toEqual([])
  })
})

describe("sortSiblings", () => {
  it("sorts alphabetically, case-insensitively", () => {
    const units = [unit({ uuid: "1", name: "charlie" }), unit({ uuid: "2", name: "Alice" }), unit({ uuid: "3", name: "bob" })]
    expect(sortSiblings(units, []).map((u) => u.uuid)).toEqual(["2", "3", "1"])
  })

  it("does not mutate the input array", () => {
    const units = [unit({ uuid: "1", name: "b" }), unit({ uuid: "2", name: "a" })]
    const original = [...units]
    sortSiblings(units, [])
    expect(units).toEqual(original)
  })

  it("forces sortToBottomUuids to the end, alphabetical order preserved among the rest", () => {
    const units = [
      unit({ uuid: "pinned", name: "Aaa" }),
      unit({ uuid: "b", name: "Bravo" }),
      unit({ uuid: "a", name: "Alpha" }),
    ]
    expect(sortSiblings(units, ["pinned"]).map((u) => u.uuid)).toEqual(["a", "b", "pinned"])
  })

  it("puts all pinned uuids after non-pinned ones (ported comparator quirk: order among multiple pinned items is comparator-order-dependent, not alphabetical)", () => {
    const units = [
      unit({ uuid: "p2", name: "Zzz" }),
      unit({ uuid: "normal", name: "Mmm" }),
      unit({ uuid: "p1", name: "Aaa" }),
    ]
    const result = sortSiblings(units, ["p1", "p2"]).map((u) => u.uuid)
    expect(result[0]).toBe("normal")
    expect(result.slice(1).sort()).toEqual(["p1", "p2"])
  })
})

describe("computePersonCounts", () => {
  const withPeople = {
    engagements: [
      { uuid: "e1", engagement_type_uuid: "student" },
      { uuid: "e2", engagement_type_uuid: "employee" },
    ],
    associations: [{ uuid: "a1" }],
  }

  it("only counts engagements when relationType is 'engagement'", () => {
    expect(computePersonCounts(withPeople, "engagement", [])).toEqual({ engagements: 2 })
  })

  it("only counts associations when relationType is 'association'", () => {
    expect(computePersonCounts(withPeople, "association", [])).toEqual({ associations: 1 })
  })

  it("counts both when relationType is 'both'", () => {
    expect(computePersonCounts(withPeople, "both", [])).toEqual({
      engagements: 2,
      associations: 1,
    })
  })

  it("excludes engagements matching removeEngagementTypeUuids", () => {
    expect(computePersonCounts(withPeople, "engagement", ["student"])).toEqual({
      engagements: 1,
    })
  })
})
