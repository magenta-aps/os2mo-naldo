import { convertDateTimes } from "$lib/http/dateTimes"
import { toMO } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"
import { describe, expect, it } from "vitest"

// A converted value, printed as its moment with offset.
const moment = (value: unknown) => {
  expect(value).toBeInstanceOf(Temporal.ZonedDateTime)
  return toMO(value as Temporal.ZonedDateTime)
}

describe("convertDateTimes", () => {
  it("converts validity bounds in nested lists", () => {
    const data = convertDateTimes({
      engagements: {
        objects: [
          {
            validities: [
              {
                validity: {
                  from: "2024-03-30T23:00:00Z",
                  to: "2024-10-28T00:00:00+01:00",
                },
              },
            ],
          },
        ],
      },
    })
    const { validity } = data.engagements.objects[0].validities[0]
    expect(moment(validity.from)).toBe("2024-03-31T00:00:00+01:00")
    expect(moment(validity.to)).toBe("2024-10-28T00:00:00+01:00")
  })

  it("converts registration times", () => {
    const data = convertDateTimes({
      registrations: [{ start: "2024-10-27T14:03:12.5+01:00", end: null }],
    })
    expect(moment(data.registrations[0].start)).toBe("2024-10-27T14:03:12.5+01:00")
    expect(data.registrations[0].end).toBeNull()
  })

  it("leaves other fields alone", () => {
    const data = convertDateTimes({
      name: "Skole",
      user_key: "2024-10-28T00:00:00+01:00",
      validity: { to: null },
    })
    expect(data).toEqual({
      name: "Skole",
      user_key: "2024-10-28T00:00:00+01:00",
      validity: { to: null },
    })
  })
})
