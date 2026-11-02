import { isValidCpr, normalizeCpr } from "$lib/utils/cpr"
import { describe, expect, it } from "vitest"

describe("isValidCpr", () => {
  it.each([
    ["0101012345", true],
    ["010101-2345", true],
    ["010101 2345", false],
    ["01010-12345", false],
    ["0101012-345", false],
    ["123456789a", false],
    ["12345", false],
    ["", false],
    [null, false],
    [undefined, false],
  ])("%s: %s", (cpr, expected) => {
    expect(isValidCpr(cpr)).toBe(expected)
  })
})

describe("normalizeCpr", () => {
  it("strips the dash", () => {
    expect(normalizeCpr("010101-2345")).toBe("0101012345")
    expect(normalizeCpr("0101012345")).toBe("0101012345")
  })

  it("is empty for no CPR", () => {
    expect(normalizeCpr(null)).toBe("")
    expect(normalizeCpr(undefined)).toBe("")
  })
})
