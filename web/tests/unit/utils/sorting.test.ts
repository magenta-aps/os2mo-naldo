/**
 * Tests for table sorting utilities.
 *
 * getValueAtPath resolves nested object values using dot/bracket notation
 * (e.g. "person[0].name"). sortData uses it to sort table rows by any column,
 * including nested fields.
 */
import { describe, it, expect } from "vitest"
import { getValueAtPath, sortData } from "$lib/utils/sorting"

describe("getValueAtPath", () => {
  it("resolves nested properties via dot notation: 'a.b' -> 42", () => {
    expect(getValueAtPath({ a: { b: 42 } }, "a.b")).toBe(42)
  })

  it("resolves array indices via bracket notation: 'a[1]' -> 20", () => {
    expect(getValueAtPath({ a: [10, 20, 30] }, "a[1]")).toBe(20)
  })

  it("resolves mixed dot and bracket paths: 'a[1].c' -> 3", () => {
    const obj = { a: [{ b: 2 }, { c: 3 }] }
    expect(getValueAtPath(obj, "a[1].c")).toBe(3)
  })

  it("returns undefined when any segment of the path is missing", () => {
    expect(getValueAtPath({ a: 1 }, "b")).toBeUndefined()
    expect(getValueAtPath({ a: { b: 1 } }, "a.c")).toBeUndefined()
  })

  it("resolves top-level properties without dots", () => {
    expect(getValueAtPath({ name: "test" }, "name")).toBe("test")
  })
})

describe("sortData", () => {
  const data = [
    { name: "Charlie", age: 30 },
    { name: "alice", age: 25 },
    { name: "Bob", age: 35 },
  ]

  it("sorts strings case-insensitively: alice < Bob < Charlie", () => {
    const result = sortData(data, "name", 1)
    expect(result.map((d) => d.name)).toEqual(["alice", "Bob", "Charlie"])
  })

  it("reverses sort order with negative direction", () => {
    const result = sortData(data, "name", -1)
    expect(result.map((d) => d.name)).toEqual(["Charlie", "Bob", "alice"])
  })

  it("sorts numeric values correctly (not as strings)", () => {
    const result = sortData(data, "age", 1)
    expect(result.map((d) => d.age)).toEqual([25, 30, 35])
  })

  it("returns a new array without mutating the original", () => {
    const original = [...data]
    sortData(data, "name", 1)
    expect(data).toEqual(original)
  })

  it("supports sorting by nested paths (e.g. table columns showing nested data)", () => {
    const nested = [
      { info: { score: 3 } },
      { info: { score: 1 } },
      { info: { score: 2 } },
    ]
    const result = sortData(nested, "info.score", 1)
    expect(result.map((d) => d.info.score)).toEqual([1, 2, 3])
  })
})
