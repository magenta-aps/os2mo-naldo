import { describe, it, expect } from "vitest"
import { getValueAtPath, sortData } from "$lib/utils/sorting"

describe("getValueAtPath", () => {
  it("returns a top-level value", () => {
    expect(getValueAtPath({ name: "Alice" }, "name")).toBe("Alice")
  })

  it("walks nested objects via dot notation", () => {
    const obj = { person: { current: { name: "Bob" } } }
    expect(getValueAtPath(obj, "person.current.name")).toBe("Bob")
  })

  it("resolves array indices via bracket notation", () => {
    const obj = { validities: [{ name: "first" }, { name: "second" }] }
    expect(getValueAtPath(obj, "validities[0].name")).toBe("first")
    expect(getValueAtPath(obj, "validities[1].name")).toBe("second")
  })

  it("returns undefined when the path does not exist", () => {
    // Regression guard: typo'd sortPaths silently return undefined, which
    // makes sortData a no-op for every row. Tests of sortData below pin this
    // behavior too.
    expect(getValueAtPath({ name: "Alice" }, "missing")).toBeUndefined()
    expect(getValueAtPath({ a: { b: 1 } }, "a.c")).toBeUndefined()
  })

  it("returns undefined for deep paths where an intermediate key is missing", () => {
    expect(getValueAtPath({ a: { b: null } }, "a.b.c") as unknown).toBeUndefined()
  })

  it("handles a leading dot in the path", () => {
    expect(getValueAtPath({ a: { b: 2 } }, ".a.b")).toBe(2)
  })
})

describe("sortData", () => {
  const rows = [
    { id: 1, name: "Charlie", nested: { value: 30 } },
    { id: 2, name: "alice", nested: { value: 10 } },
    { id: 3, name: "Bob", nested: { value: 20 } },
  ]

  it("sorts ascending by a top-level string key, case-insensitive", () => {
    const result = sortData(rows, "name", 1).map((r) => r.id)
    expect(result).toEqual([2, 3, 1])
  })

  it("sorts descending when direction is -1", () => {
    const result = sortData(rows, "name", -1).map((r) => r.id)
    expect(result).toEqual([1, 3, 2])
  })

  it("sorts by a nested path", () => {
    const result = sortData(rows, "nested.value", 1).map((r) => r.id)
    expect(result).toEqual([2, 3, 1])
  })

  it("returns a new array without mutating the input", () => {
    const original = [...rows]
    sortData(rows, "name", 1)
    expect(rows).toEqual(original)
  })

  it("preserves order when sortKey resolves to undefined on every row", () => {
    // This is the silent-typo hazard: a bad sortPath makes every comparison
    // return 0, so the input order is preserved. Pinning behavior so a future
    // change (e.g. moving invalid values to the end) is deliberate.
    const result = sortData(rows, "nonexistent.path", 1).map((r) => r.id)
    expect(result).toEqual([1, 2, 3])
  })

  it("sorts numerically when values are numbers", () => {
    const result = sortData(rows, "id", -1).map((r) => r.id)
    expect(result).toEqual([3, 2, 1])
  })
})
