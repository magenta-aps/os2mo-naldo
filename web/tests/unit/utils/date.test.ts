/**
 * Tests for date formatting utilities.
 *
 * All dates in the UI are displayed in Europe/Copenhagen timezone.
 * These tests verify that UTC and offset dates are correctly converted,
 * including the summer/winter time difference (CEST UTC+2 vs CET UTC+1).
 */
import { describe, it, expect } from "vitest"
import { formatDate, formatDateTime } from "$lib/utils/date"

describe("formatDate", () => {
  it("formats a CEST date to dd-MM-yyyy", () => {
    expect(formatDate("2023-06-15T00:00:00+02:00")).toBe("15-06-2023")
  })

  it("does not shift date backwards when converting midnight UTC to Copenhagen", () => {
    // Midnight UTC = 01:00 CET, so the date should stay the same
    expect(formatDate("2023-01-15T00:00:00Z")).toBe("15-01-2023")
  })

  it("shifts date forward when late UTC time crosses midnight in Copenhagen", () => {
    // 23:00 UTC in summer = 01:00 next day CEST
    expect(formatDate("2023-06-14T23:00:00Z")).toBe("15-06-2023")
  })
})

describe("formatDateTime", () => {
  it("formats to dd-MM-yyyy, HH:mm:ss preserving the Copenhagen time", () => {
    expect(formatDateTime("2023-06-15T14:30:45+02:00")).toBe("15-06-2023, 14:30:45")
  })

  it("returns empty string for empty input", () => {
    expect(formatDateTime("")).toBe("")
  })

  it("converts UTC to CEST (UTC+2) in summer", () => {
    expect(formatDateTime("2023-06-15T12:00:00Z")).toBe("15-06-2023, 14:00:00")
  })

  it("converts UTC to CET (UTC+1) in winter", () => {
    expect(formatDateTime("2023-01-15T12:00:00Z")).toBe("15-01-2023, 13:00:00")
  })
})
