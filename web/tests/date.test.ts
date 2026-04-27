import { describe, it, expect } from "vitest"
import { formatDate, formatDateTime } from "$lib/utils/date"

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
