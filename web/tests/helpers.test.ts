import { describe, it, expect } from "vitest"
import {
  capital,
  formatITSystemNames,
  formatITUserITSystemName,
  formatITUserITSystemNames,
  formatKleNumberTitleAndUuid,
  isUUID,
  shouldSuffixSDCode,
  upperCase,
} from "$lib/utils/helpers"

describe("isUUID", () => {
  it("accepts a valid UUID v4", () => {
    expect(isUUID("e0f496c4-bb51-47af-baeb-3fb771c51a9f")).toBe(true)
  })

  it("accepts upper-case hex", () => {
    expect(isUUID("E0F496C4-BB51-47AF-BAEB-3FB771C51A9F")).toBe(true)
  })

  it("rejects strings with wrong segment lengths", () => {
    expect(isUUID("e0f496c4-bb51-47af-baeb-3fb771c51a9")).toBe(false)
    expect(isUUID("e0f496c4bb5147afbaeb3fb771c51a9f")).toBe(false)
  })

  it("rejects non-v4 version digits", () => {
    // 3rd segment must start with 4
    expect(isUUID("e0f496c4-bb51-37af-baeb-3fb771c51a9f")).toBe(false)
  })

  it("rejects invalid variant digits", () => {
    // 4th segment must start with 8/9/a/b
    expect(isUUID("e0f496c4-bb51-47af-ceeb-3fb771c51a9f")).toBe(false)
  })

  it("rejects obvious non-UUIDs", () => {
    expect(isUUID("")).toBe(false)
    expect(isUUID("not-a-uuid")).toBe(false)
    expect(isUUID("12345")).toBe(false)
  })
})

describe("capital", () => {
  it("uppercases the first letter of the first word", () => {
    expect(capital("hello world")).toBe("Hello world")
  })

  it("leaves an already-capitalised string unchanged", () => {
    expect(capital("Hello world")).toBe("Hello world")
  })

  it("works on single words", () => {
    expect(capital("manager")).toBe("Manager")
  })

  it("handles leading whitespace by capitalising the first non-space", () => {
    // Regex matches start-of-string OR whitespace followed by a non-space —
    // so a leading space keeps the space and capitalises the letter after it.
    expect(capital(" hello")).toBe(" Hello")
  })

  it("returns empty string unchanged", () => {
    expect(capital("")).toBe("")
  })
})

describe("shouldSuffixSDCode", () => {
  // Extracted from `checkSDIdentifier` so the predicate can be tested
  // without mocking $env/dynamic/public.
  it("returns false when the SD-code flag is off", () => {
    expect(shouldSuffixSDCode("Name", "user_key", false)).toBe(false)
  })

  it("returns true when flag is on and user_key is a meaningful distinct code", () => {
    expect(shouldSuffixSDCode("Name", "ABC123", true)).toBe(true)
  })

  it("returns false when name equals user_key (nothing to add)", () => {
    expect(shouldSuffixSDCode("ABC123", "ABC123", true)).toBe(false)
  })

  it("returns false when user_key is the 'no value' placeholder '-'", () => {
    expect(shouldSuffixSDCode("Name", "-", true)).toBe(false)
  })

  it("returns false when user_key is itself a UUID (auto-generated, not an SD code)", () => {
    expect(
      shouldSuffixSDCode("Name", "e0f496c4-bb51-47af-baeb-3fb771c51a9f", true)
    ).toBe(false)
  })
})

describe("upperCase", () => {
  it("uppercases all letters", () => {
    expect(upperCase("id")).toBe("ID")
    expect(upperCase("Hello")).toBe("HELLO")
  })
})

describe("formatKleNumberTitleAndUuid", () => {
  it("joins user_key and name, sorts alphabetically by the combined string", () => {
    const result = formatKleNumberTitleAndUuid([
      { uuid: "c", user_key: "03", name: "Gamma" },
      { uuid: "a", user_key: "01", name: "Alpha" },
      { uuid: "b", user_key: "02", name: "Beta" },
    ])
    expect(result).toEqual([
      { uuid: "a", name: "01 - Alpha" },
      { uuid: "b", name: "02 - Beta" },
      { uuid: "c", name: "03 - Gamma" },
    ])
  })

  it("returns empty array when input is empty", () => {
    expect(formatKleNumberTitleAndUuid([])).toEqual([])
  })
})

describe("formatITSystemNames", () => {
  it("filters out entries with null current, maps to flat shape, sorts by name", () => {
    const result = formatITSystemNames([
      { current: { uuid: "b", name: "SAP", user_key: "sap" } },
      { current: null },
      { current: { uuid: "a", name: "Active Directory", user_key: "ad" } },
    ])
    expect(result).toEqual([
      { uuid: "a", name: "Active Directory", user_key: "ad" },
      { uuid: "b", name: "SAP", user_key: "sap" },
    ])
  })

  it("leaves user_key undefined when missing", () => {
    const result = formatITSystemNames([
      { current: { uuid: "a", name: "Active Directory" } },
    ])
    expect(result[0].user_key).toBeUndefined()
  })
})

describe("formatITUserITSystemName", () => {
  it("formats 'itsystem-name, user_key' for a single ituser", () => {
    const result = formatITUserITSystemName({
      uuid: "u1",
      user_key: "bruce",
      itsystem_response: { uuid: "s1", current: { name: "AD" } },
    })
    expect(result).toEqual({ uuid: "u1", name: "AD, bruce", itsystem: { uuid: "s1" } })
  })

  it("falls back to itsystem uuid when current is null", () => {
    const result = formatITUserITSystemName({
      uuid: "u1",
      user_key: "bruce",
      itsystem_response: { uuid: "s1", current: null },
    })
    expect(result.name).toBe("s1, bruce")
  })
})

describe("formatITUserITSystemNames", () => {
  it("maps the singular formatter over a list, preserving order", () => {
    const result = formatITUserITSystemNames([
      {
        uuid: "u1",
        user_key: "bruce",
        itsystem_response: { uuid: "s1", current: { name: "AD" } },
      },
      {
        uuid: "u2",
        user_key: "katrine",
        itsystem_response: { uuid: "s2", current: { name: "SAP" } },
      },
    ])
    expect(result).toEqual([
      { uuid: "u1", name: "AD, bruce", itsystem: { uuid: "s1" } },
      { uuid: "u2", name: "SAP, katrine", itsystem: { uuid: "s2" } },
    ])
  })

  it("returns undefined when input is undefined", () => {
    expect(formatITUserITSystemNames(undefined)).toBeUndefined()
  })
})
