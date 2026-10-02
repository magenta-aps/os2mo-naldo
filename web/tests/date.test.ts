import {
  firstValidDay,
  formatDate,
  formatDateTime,
  formatDay,
  formatTimestamp,
  fromJavaScriptDate,
  lastValidDay,
  moValidityFrom,
  moValidityTo,
  sameDate,
  startOfDay,
  toCopenhagen,
  toJavaScriptDate,
  toMO,
} from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"
import { describe, expect, it } from "vitest"

// formatDate and formatDateTime anchor display to Europe/Copenhagen regardless of the
// incoming timezone offset, so the tests use inputs with mixed offsets to
// confirm the conversion.
describe("formatDate", () => {
  it("formats an ISO date in dd-MM-yyyy", () => {
    expect(formatDate("2020-01-15T10:00:00+01:00")).toBe("15-01-2020")
  })

  it("converts UTC to Copenhagen local date", () => {
    // 2020-07-15 23:30 UTC is 2020-07-16 01:30 CEST — a date boundary flip
    expect(formatDate("2020-07-15T23:30:00Z")).toBe("16-07-2020")
  })

  it("is idempotent on zero-time instants", () => {
    expect(formatDate("2020-01-01T00:00:00+01:00")).toBe("01-01-2020")
  })
})

describe("formatDateTime", () => {
  it("formats an ISO datetime in dd-MM-yyyy, HH:mm:ss (Copenhagen)", () => {
    expect(formatDateTime("2020-01-15T10:30:45+01:00")).toBe("15-01-2020, 10:30:45")
  })

  it("returns empty string for empty input", () => {
    expect(formatDateTime("")).toBe("")
  })

  it("converts UTC to Copenhagen clock time", () => {
    // 2020-07-15 10:00 UTC = 2020-07-15 12:00 CEST
    expect(formatDateTime("2020-07-15T10:00:00Z")).toBe("15-07-2020, 12:00:00")
  })
})

// Temporal objects keep their values in internal slots, so `toEqual` passes for
// any two of them. The tests compare their string form instead.

describe("toCopenhagen", () => {
  it("keeps the moment and reads it in Copenhagen", () => {
    // 2024-10-27 23:00 UTC is 2024-10-28 00:00 CET
    expect(toMO(toCopenhagen("2024-10-27T23:00:00Z"))).toBe("2024-10-28T00:00:00+01:00")
  })

  it("refuses a timestamp without an offset", () => {
    expect(() => toCopenhagen("2024-10-28T00:00:00")).toThrow(RangeError)
  })

  // Mirrors FastRAMQPI's test of parse_graphql_datetime. 2010-10-31 is the day
  // wintertime starts in Copenhagen.
  it("gives the Copenhagen time zone, not just the offset", () => {
    const timestamp = "2010-10-31T00:00:00+02:00"
    const utcOffset = Temporal.Instant.from(timestamp).toZonedDateTimeISO("+02:00")
    const copenhagen = toCopenhagen(timestamp)
    expect(copenhagen.timeZoneId).toBe("Europe/Copenhagen")
    expect(toMO(copenhagen)).toBe(toMO(utcOffset))

    expect(toMO(copenhagen.add({ days: 1 }))).toBe("2010-11-01T00:00:00+01:00")
    expect(toMO(utcOffset.add({ days: 1 }))).toBe("2010-11-01T00:00:00+02:00")
  })
})

describe("toJavaScriptDate and fromJavaScriptDate", () => {
  it("keep the moment", () => {
    const moment = toCopenhagen("2024-10-28T00:00:00+01:00")
    expect(toJavaScriptDate(moment).toISOString()).toBe("2024-10-27T23:00:00.000Z")
    expect(toMO(fromJavaScriptDate(toJavaScriptDate(moment)))).toBe(
      "2024-10-28T00:00:00+01:00"
    )
  })
})

const day = (s: string) => Temporal.PlainDate.from(s)

describe("startOfDay", () => {
  it("is midnight in Copenhagen, with the offset of that day", () => {
    expect(toMO(startOfDay(day("2024-10-27")))).toBe("2024-10-27T00:00:00+02:00")
    expect(toMO(startOfDay(day("2024-10-28")))).toBe("2024-10-28T00:00:00+01:00")
  })
})

describe("sameDate", () => {
  it("compares the moment, not the object", () => {
    const a = toCopenhagen("2024-03-01T00:00:00+01:00")
    expect(sameDate(a, toCopenhagen("2024-02-29T23:00:00Z"))).toBe(true)
    expect(sameDate(a, toCopenhagen("2024-03-02T00:00:00+01:00"))).toBe(false)
  })

  it("compares days by value", () => {
    expect(sameDate(day("2024-03-01"), day("2024-03-01"))).toBe(true)
    expect(sameDate(day("2024-03-01"), day("2024-03-02"))).toBe(false)
  })

  it("tells null, undefined and a moment apart", () => {
    const a = toCopenhagen("2024-03-01T00:00:00+01:00")
    expect(sameDate(undefined, undefined)).toBe(true)
    expect(sameDate(null, null)).toBe(true)
    expect(sameDate(null, undefined)).toBe(false)
    expect(sameDate(a, null)).toBe(false)
    expect(sameDate(undefined, a)).toBe(false)
  })
})

describe("firstValidDay", () => {
  it("is the day of a midnight `from`", () => {
    expect(firstValidDay(toCopenhagen("2024-10-01T00:00:00+02:00"))?.toString()).toBe(
      "2024-10-01"
    )
  })

  it("fails for a `from` that isn't at midnight", () => {
    expect(() => firstValidDay(toCopenhagen("2024-10-01T12:00:00+02:00"))).toThrow(
      "is not at midnight in Copenhagen"
    )
  })

  it("is null for an open start", () => {
    expect(firstValidDay(null)).toBeNull()
  })
})

describe("lastValidDay", () => {
  it("is the day before a midnight `to`", () => {
    expect(lastValidDay(toCopenhagen("2024-11-01T00:00:00+01:00"))?.toString()).toBe(
      "2024-10-31"
    )
  })

  it("is the day before across the daylight saving switches", () => {
    // 2024-03-31 has 23 hours in Copenhagen, 2024-10-27 has 25
    expect(lastValidDay(toCopenhagen("2024-04-01T00:00:00+02:00"))?.toString()).toBe(
      "2024-03-31"
    )
    expect(lastValidDay(toCopenhagen("2024-10-28T00:00:00+01:00"))?.toString()).toBe(
      "2024-10-27"
    )
  })

  it("fails for a `to` that isn't at midnight", () => {
    expect(() => lastValidDay(toCopenhagen("2024-11-01T12:00:00+01:00"))).toThrow(
      "is not at midnight in Copenhagen"
    )
  })

  it("is null for an open end", () => {
    expect(lastValidDay(null)).toBeNull()
  })
})

describe("moValidityFrom", () => {
  it("is midnight at the start of the picked day, with Copenhagen's offset", () => {
    expect(toMO(moValidityFrom(day("2024-10-27")))).toBe("2024-10-27T00:00:00+02:00")
    expect(toMO(moValidityFrom(day("2024-10-28")))).toBe("2024-10-28T00:00:00+01:00")
  })

  it("reverses firstValidDay", () => {
    const from = toCopenhagen("2024-11-01T00:00:00+01:00")
    expect(toMO(moValidityFrom(firstValidDay(from)!))).toBe(toMO(from))
  })
})

describe("moValidityTo", () => {
  it("is midnight after the picked day, with Copenhagen's offset", () => {
    expect(toMO(moValidityTo(day("2024-10-26")))).toBe("2024-10-27T00:00:00+02:00")
    expect(toMO(moValidityTo(day("2024-10-27")))).toBe("2024-10-28T00:00:00+01:00")
    expect(toMO(moValidityTo(day("2024-12-31")))).toBe("2025-01-01T00:00:00+01:00")
  })

  it("reverses lastValidDay", () => {
    const to = toCopenhagen("2024-11-01T00:00:00+01:00")
    expect(toMO(moValidityTo(lastValidDay(to)!))).toBe(toMO(to))
  })
})

describe("formatTimestamp", () => {
  // ICU versions disagree on what joins the date and the time ("27.10.2024
  // 14.03" or "27.10.2024, 14.03"), so only the parts are pinned.
  it("formats the date and time in Danish, in Copenhagen", () => {
    expect(formatTimestamp(toCopenhagen("2024-10-27T13:03:00Z"))).toMatch(
      /^27\.10\.2024,? 14\.03$/
    )
  })
})

describe("formatDay", () => {
  it("formats in Danish, with two-digit day and month", () => {
    expect(formatDay(Temporal.PlainDate.from("2024-03-05"))).toBe("05.03.2024")
  })

  it("is empty for no day", () => {
    expect(formatDay(null)).toBe("")
  })
})
