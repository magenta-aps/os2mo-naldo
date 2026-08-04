import { CPR_PATTERN, isValidCpr, normalizeCpr } from "$lib/utils/cpr"
import { describe, expect, it } from "vitest"

describe("CPR_PATTERN", () => {
  it("accepts 10 digits", () => {
    expect(CPR_PATTERN.test("0101012345")).toBe(true)
  })

  it("accepts a dash separator at position 6", () => {
    expect(CPR_PATTERN.test("010101-2345")).toBe(true)
  })

  it("rejects a space separator", () => {
    expect(CPR_PATTERN.test("010101 2345")).toBe(false)
  })

  it("rejects a dash anywhere else", () => {
    expect(CPR_PATTERN.test("01010-12345")).toBe(false)
    expect(CPR_PATTERN.test("0101012-345")).toBe(false)
  })

  it("rejects non-digits and wrong lengths", () => {
    expect(CPR_PATTERN.test("123456789a")).toBe(false)
    expect(CPR_PATTERN.test("12345")).toBe(false)
    expect(CPR_PATTERN.test("")).toBe(false)
  })
})

describe("isValidCpr", () => {
  it("treats null and undefined as invalid", () => {
    expect(isValidCpr(null)).toBe(false)
    expect(isValidCpr(undefined)).toBe(false)
  })
})

describe("normalizeCpr", () => {
  it("strips dash", () => {
    expect(normalizeCpr("010101-2345")).toBe("0101012345")
    expect(normalizeCpr("0101012345")).toBe("0101012345")
  })

  it("returns empty string for null/undefined", () => {
    expect(normalizeCpr(null)).toBe("")
    expect(normalizeCpr(undefined)).toBe("")
  })
})
