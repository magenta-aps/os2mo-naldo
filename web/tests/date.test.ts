import {
  dayAfter,
  dayBefore,
  formatDate,
  formatDateTime,
  formatDay,
  toCopenhagenDay,
} from "$lib/utils/date"
import { describe, expect, it } from "vitest"

// Both helpers anchor display to Europe/Copenhagen regardless of the
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

describe("toCopenhagenDay", () => {
  it("returns the Copenhagen date of a midnight timestamp", () => {
    expect(toCopenhagenDay("2024-10-28T00:00:00+01:00")).toBe("2024-10-28")
    expect(toCopenhagenDay("2024-04-01T00:00:00+02:00")).toBe("2024-04-01")
  })

  it("reads the date in Copenhagen, not in the offset it arrives in", () => {
    // 2024-10-27 23:00 UTC is 2024-10-28 00:00 CET
    expect(toCopenhagenDay("2024-10-27T23:00:00Z")).toBe("2024-10-28")
  })
})

describe("dayBefore", () => {
  it("returns the previous calendar day", () => {
    expect(dayBefore("2024-10-28")).toBe("2024-10-27")
  })

  it("steps across month, year and leap-day boundaries", () => {
    expect(dayBefore("2024-03-01")).toBe("2024-02-29")
    expect(dayBefore("2025-01-01")).toBe("2024-12-31")
  })

  it("steps one day across the daylight saving switches", () => {
    // 2024-03-31 has 23 hours in Copenhagen, 2024-10-27 has 25
    expect(dayBefore("2024-04-01")).toBe("2024-03-31")
    expect(dayBefore("2024-10-28")).toBe("2024-10-27")
  })

  it("returns null for an open end", () => {
    expect(dayBefore(null)).toBeNull()
    expect(dayBefore(undefined)).toBeNull()
  })
})

describe("dayAfter", () => {
  it("returns the next calendar day", () => {
    expect(dayAfter("2024-10-27")).toBe("2024-10-28")
  })

  it("steps across month, year and leap-day boundaries", () => {
    expect(dayAfter("2024-02-28")).toBe("2024-02-29")
    expect(dayAfter("2024-12-31")).toBe("2025-01-01")
  })

  it("steps one day across the daylight saving switches", () => {
    expect(dayAfter("2024-03-31")).toBe("2024-04-01")
    expect(dayAfter("2024-10-27")).toBe("2024-10-28")
  })

  it("returns null for an empty input", () => {
    expect(dayAfter("")).toBeNull()
    expect(dayAfter(null)).toBeNull()
  })
})

describe("formatDay", () => {
  it("formats a yyyy-MM-dd day as dd-MM-yyyy", () => {
    expect(formatDay("2024-10-27")).toBe("27-10-2024")
  })
})
