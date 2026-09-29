import { convertValiditiesToDays } from "$lib/http/validityDays"
import { describe, expect, it } from "vitest"

describe("convertValiditiesToDays", () => {
  it("converts validity bounds to Copenhagen days", () => {
    expect(
      convertValiditiesToDays({
        validity: {
          from: "2024-03-31T00:00:00+01:00",
          to: "2024-10-28T00:00:00+01:00",
        },
      })
    ).toEqual({ validity: { from: "2024-03-31", to: "2024-10-28" } })
  })

  it("keeps an open end", () => {
    expect(
      convertValiditiesToDays({
        validity: { from: "2024-01-01T00:00:00+01:00", to: null },
      })
    ).toEqual({ validity: { from: "2024-01-01", to: null } })
  })

  it("converts nested validities and the `_validity` aliases", () => {
    const response = {
      engagements: {
        objects: [
          {
            validities: [
              {
                validity: { from: "2024-01-01T00:00:00+01:00", to: null },
                person_validity: { from: "2020-01-01T00:00:00+01:00", to: null },
              },
            ],
          },
        ],
      },
    }
    expect(convertValiditiesToDays(response)).toEqual({
      engagements: {
        objects: [
          {
            validities: [
              {
                validity: { from: "2024-01-01", to: null },
                person_validity: { from: "2020-01-01", to: null },
              },
            ],
          },
        ],
      },
    })
  })

  it("leaves timestamps outside validities alone", () => {
    const registration = { start: "2024-10-27T14:03:12.5+01:00", actor: "bruce" }
    expect(convertValiditiesToDays(registration)).toEqual(registration)
  })
})
