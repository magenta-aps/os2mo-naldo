/**
 * Tests for class/facet lookup utilities.
 *
 * These functions are used throughout forms to find the right facet classes
 * (e.g. engagement types, association types) by their user_key identifier.
 * Getting this wrong means forms show the wrong dropdown options.
 */
import { describe, it, expect } from "vitest"
import {
  filterClassesByFacetUserKey,
  filterClassUuidByUserKey,
  filterClassByUserKey,
} from "$lib/utils/classes"

describe("filterClassesByFacetUserKey", () => {
  const facets = [
    {
      validities: [
        {
          uuid: "facet-1",
          user_key: "engagement_type",
          classes: [
            { name: "Frivillig", uuid: "class-a", user_key: "Frivillig" },
            { name: "Ansat", uuid: "class-b", user_key: "Ansat" },
          ],
        },
      ],
    },
    {
      validities: [
        {
          uuid: "facet-2",
          user_key: "association_type",
          classes: [
            { name: "Projektleder", uuid: "class-c", user_key: "Projektleder" },
          ],
        },
      ],
    },
  ]

  it("finds facet by user_key and returns its classes sorted alphabetically by name", () => {
    const result = filterClassesByFacetUserKey(facets, "engagement_type")
    expect(result).toEqual([
      { name: "Ansat", uuid: "class-b", user_key: "Ansat" },
      { name: "Frivillig", uuid: "class-a", user_key: "Frivillig" },
    ])
  })

  it("returns classes from the correct facet when multiple facets exist", () => {
    const result = filterClassesByFacetUserKey(facets, "association_type")
    expect(result).toEqual([
      { name: "Projektleder", uuid: "class-c", user_key: "Projektleder" },
    ])
  })

  it("throws when no facet matches the given user_key", () => {
    expect(() => filterClassesByFacetUserKey(facets, "unknown")).toThrow(
      "user_key did not match"
    )
  })
})

describe("filterClassUuidByUserKey", () => {
  const classes = [
    { validities: [{ uuid: "cls-1", user_key: "primary", name: "Primær" }] },
    { validities: [{ uuid: "cls-2", user_key: "secondary", name: "Sekundær" }] },
  ]

  it("looks up a class uuid by its user_key (used to resolve e.g. primary class)", () => {
    expect(filterClassUuidByUserKey(classes, "primary")).toBe("cls-1")
    expect(filterClassUuidByUserKey(classes, "secondary")).toBe("cls-2")
  })

  it("throws when no class matches", () => {
    expect(() => filterClassUuidByUserKey(classes, "nope")).toThrow()
  })
})

describe("filterClassByUserKey", () => {
  const classes = [
    { validities: [{ uuid: "cls-1", user_key: "primary", name: "Primær" }] },
  ]

  it("returns the full validity object (uuid, user_key, name) for the matching class", () => {
    expect(filterClassByUserKey(classes, "primary")).toEqual({
      uuid: "cls-1",
      user_key: "primary",
      name: "Primær",
    })
  })
})
