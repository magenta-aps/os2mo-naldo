import { describe, it, expect } from "vitest"
import { bool, environment, json } from "$lib/env"

// These parsers are tested in isolation from the env singleton so we don't
// need to mock `$env/dynamic/public`. They each map an optional string env
// value to a typed JS value, with an explicit throw on invalid input —
// that throw-on-invalid is the contract #68747 added, and it's the main
// regression guard here.

describe("bool", () => {
  it("returns true for 'true'", () => {
    expect(bool("true")).toBe(true)
  })

  it("returns false for 'false'", () => {
    expect(bool("false")).toBe(false)
  })

  it("returns the default when value is undefined", () => {
    expect(bool(undefined)).toBe(false)
    expect(bool(undefined, true)).toBe(true)
  })

  it("returns the default when value is empty string", () => {
    expect(bool("")).toBe(false)
    expect(bool("", true)).toBe(true)
  })

  it("throws on any other string (strict parsing, no silent fallback)", () => {
    expect(() => bool("1")).toThrow(/Invalid boolean env var/)
    expect(() => bool("yes")).toThrow(/Invalid boolean env var/)
    expect(() => bool("TRUE")).toThrow(/Invalid boolean env var/)
  })
})

describe("environment", () => {
  it.each(["dev", "test", "prod"] as const)("accepts '%s'", (v) => {
    expect(environment(v)).toBe(v)
  })

  it("returns the default when value is undefined", () => {
    expect(environment(undefined)).toBe("dev")
    expect(environment(undefined, "prod")).toBe("prod")
  })

  it("throws on any other value", () => {
    expect(() => environment("staging")).toThrow(/Invalid PUBLIC_ENVIRONMENT/)
    expect(() => environment("Prod")).toThrow(/Invalid PUBLIC_ENVIRONMENT/)
  })
})

describe("json", () => {
  it("parses a valid JSON array", () => {
    expect(json<number[]>("[1,2,3]", [])).toEqual([1, 2, 3])
  })

  it("parses a valid JSON object", () => {
    expect(json<{ a: number }>('{"a":1}', { a: 0 })).toEqual({ a: 1 })
  })

  it("returns the default for undefined/empty", () => {
    expect(json<string[]>(undefined, ["fallback"])).toEqual(["fallback"])
    expect(json<string[]>("", ["fallback"])).toEqual(["fallback"])
  })

  it("throws on invalid JSON", () => {
    expect(() => json("{not-valid", {})).toThrow(/Invalid JSON in env var/)
    expect(() => json("undefined", {})).toThrow(/Invalid JSON in env var/)
  })
})
