import { env } from "$lib/env"
import {
  filterClassByUserKey,
  filterClassesByFacetUserKey,
  filterClassUuidByUserKey,
  primaryClassUuid,
} from "$lib/utils/classes"
import { describe, expect, it } from "vitest"

describe("filterClassesByFacetUserKey", () => {
  const facets = [
    {
      validities: [
        {
          uuid: "facet-1",
          user_key: "engagement_type",
          classes_responses: {
            objects: [
              {
                uuid: "class-a",
                current: { name: "Frivillig", user_key: "Frivillig" },
              },
              {
                uuid: "class-b",
                current: { name: "Ansat", user_key: "Ansat" },
              },
            ],
          },
        },
      ],
    },
    {
      validities: [
        {
          uuid: "facet-2",
          user_key: "association_type",
          classes_responses: {
            objects: [
              {
                uuid: "class-c",
                current: {
                  name: "Projektleder",
                  user_key: "Projektleder",
                },
              },
            ],
          },
        },
      ],
    },
  ]

  it("returns classes sorted by name", () => {
    const result = filterClassesByFacetUserKey(facets, "engagement_type")
    expect(result).toEqual([
      { name: "Ansat", uuid: "class-b", user_key: "Ansat", scope: undefined },
      { name: "Frivillig", uuid: "class-a", user_key: "Frivillig", scope: undefined },
    ])
  })

  it("finds the correct facet", () => {
    const result = filterClassesByFacetUserKey(facets, "association_type")
    expect(result).toEqual([
      {
        name: "Projektleder",
        uuid: "class-c",
        user_key: "Projektleder",
      },
    ])
  })

  it("throws on unknown user_key", () => {
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

  it("returns the uuid for matching user_key", () => {
    expect(filterClassUuidByUserKey(classes, "primary")).toBe("cls-1")
    expect(filterClassUuidByUserKey(classes, "secondary")).toBe("cls-2")
  })

  it("throws on unknown user_key", () => {
    expect(() => filterClassUuidByUserKey(classes, "nope")).toThrow()
  })
})

describe("filterClassByUserKey", () => {
  const classes = [
    { validities: [{ uuid: "cls-1", user_key: "primary", name: "Primær" }] },
  ]

  it("returns the full validity object", () => {
    expect(filterClassByUserKey(classes, "primary")).toEqual({
      uuid: "cls-1",
      user_key: "primary",
      name: "Primær",
    })
  })
})

describe("primaryClassUuid", () => {
  it("returns the uuid of the primary class", () => {
    const primary = { uuid: "p1", user_key: env.PUBLIC_PRIMARY_CLASS_USER_KEY }
    expect(primaryClassUuid(primary)).toBe("p1")
  })

  it("returns undefined for any other class", () => {
    expect(primaryClassUuid({ uuid: "n1", user_key: "non-primary" })).toBeUndefined()
  })

  it("returns undefined when nothing is picked", () => {
    expect(primaryClassUuid(undefined)).toBeUndefined()
    const noUuid = { uuid: null, user_key: env.PUBLIC_PRIMARY_CLASS_USER_KEY }
    expect(primaryClassUuid(noUuid)).toBeUndefined()
  })
})
