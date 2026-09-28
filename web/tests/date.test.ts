import {
  exclusiveTo,
  formatDate,
  formatDateTime,
  formatLastValidDay,
  lastValidDay,
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

describe("lastValidDay", () => {
  it("returns the day before a midnight `to`", () => {
    expect(lastValidDay("2024-04-04T00:00:00+02:00")).toBe("2024-04-03")
  })

  it("returns the day before across a month and year boundary", () => {
    expect(lastValidDay("2025-01-01T00:00:00+01:00")).toBe("2024-12-31")
  })

  it("returns the day before across the DST switch", () => {
    // 2024-03-31 is 23 hours long; 24 hours before this `to` is 2024-03-30 23:00
    expect(lastValidDay("2024-04-01T00:00:00+02:00")).toBe("2024-03-31")
  })

  it("reads midnight in Copenhagen time, not the offset it arrives in", () => {
    // 2024-04-03 22:00 UTC is 2024-04-04 00:00 CEST
    expect(lastValidDay("2024-04-03T22:00:00Z")).toBe("2024-04-03")
  })

  it("keeps the date of a `to` later than midnight", () => {
    expect(lastValidDay("2024-04-04T12:00:00+02:00")).toBe("2024-04-04")
  })

  it("keeps the date of a `to` one second past midnight", () => {
    expect(lastValidDay("2024-04-04T00:00:01+02:00")).toBe("2024-04-04")
  })

  it("returns null for an open-ended validity", () => {
    expect(lastValidDay(null)).toBeNull()
    expect(lastValidDay(undefined)).toBeNull()
  })
})

describe("formatLastValidDay", () => {
  it("formats the day before a midnight `to` in dd-MM-yyyy", () => {
    expect(formatLastValidDay("2024-04-04T00:00:00+02:00")).toBe("03-04-2024")
  })
})

describe("exclusiveTo", () => {
  it("returns the day after the last valid day", () => {
    expect(exclusiveTo("2024-04-03")).toBe("2024-04-04")
  })

  it("steps across a month and year boundary", () => {
    expect(exclusiveTo("2024-12-31")).toBe("2025-01-01")
  })

  it("steps across the DST switch", () => {
    expect(exclusiveTo("2024-03-31")).toBe("2024-04-01")
  })

  it("returns null for an empty input", () => {
    expect(exclusiveTo("")).toBeNull()
    expect(exclusiveTo(null)).toBeNull()
  })

  it("reverses lastValidDay on a midnight `to`", () => {
    expect(exclusiveTo(lastValidDay("2024-04-04T00:00:00+02:00"))).toBe("2024-04-04")
  })
})
