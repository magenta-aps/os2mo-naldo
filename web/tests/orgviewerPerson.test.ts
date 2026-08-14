import {
  findRelationForOrgUnit,
  resolveOrgUnitUuid,
} from "$lib/components/orgviewer/person/person"
import { describe, expect, it } from "vitest"

describe("resolveOrgUnitUuid", () => {
  const person = {
    engagements: [{ org_unit_uuid: "eng-org" }],
    associations: [{ org_unit_uuid: "assoc-org" }],
  }

  it("uses the association's org unit when relationType is 'association'", () => {
    expect(resolveOrgUnitUuid(person, "association")).toBe("assoc-org")
  })

  it("uses the engagement's org unit when relationType is 'engagement'", () => {
    expect(resolveOrgUnitUuid(person, "engagement")).toBe("eng-org")
  })

  it("prefers the engagement's org unit when relationType is 'both'", () => {
    expect(resolveOrgUnitUuid(person, "both")).toBe("eng-org")
  })

  it("falls back to the association's org unit for 'both' when there are no engagements", () => {
    expect(
      resolveOrgUnitUuid({ engagements: [], associations: person.associations }, "both")
    ).toBe("assoc-org")
  })

  it("returns undefined when the relevant relation list is empty", () => {
    expect(resolveOrgUnitUuid({ engagements: [], associations: [] }, "engagement")).toBeUndefined()
  })
})

describe("findRelationForOrgUnit", () => {
  const relations = [{ org_unit_uuid: "a", label: "first" }, { org_unit_uuid: "b", label: "second" }]

  it("returns the first relation when no org unit uuid is given", () => {
    expect(findRelationForOrgUnit(relations, undefined)?.label).toBe("first")
  })

  it("finds the relation matching the given org unit uuid", () => {
    expect(findRelationForOrgUnit(relations, "b")?.label).toBe("second")
  })

  it("returns undefined (no fallback) when the org unit uuid doesn't match any relation", () => {
    expect(findRelationForOrgUnit(relations, "nonexistent")).toBeUndefined()
  })
})
