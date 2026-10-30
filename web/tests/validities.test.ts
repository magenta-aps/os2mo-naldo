import {
  clampDateToValidity,
  filterValiditiesInRange,
  findClosestValidity,
  findClosestValidityWithin,
  formatQueryDates,
  getMinMaxValidities,
} from "$lib/utils/validities"
import { describe, expect, it } from "vitest"
import { dated, day, midnight, validity } from "./fixtures"

const TODAY = day("2020-01-01")

describe("findClosestValidity", () => {
  it("returns a lone validity as is", () => {
    const only = dated("2000-01-01", "2010-01-01")
    expect(findClosestValidity([only], TODAY)).toBe(only)
  })

  it("returns the validity active on the date", () => {
    const past = dated("1990-01-01", "2000-01-01")
    const active = dated("2015-01-01", "2025-01-01")
    const future = dated("2030-01-01", null)
    expect(findClosestValidity([past, active, future], TODAY)).toBe(active)
  })

  it("counts a validity whose last valid day is the date as active", () => {
    const endsToday = dated("2015-01-01", "2020-01-02")
    const later = dated("2025-01-01", "2030-01-01")
    expect(findClosestValidity([later, endsToday], TODAY)).toBe(endsToday)
  })

  it("does not count a validity whose `to` is the date as active", () => {
    const endedYesterday = dated("2015-01-01", "2020-01-01")
    const renamedToday = dated("2020-01-01", null)
    expect(findClosestValidity([endedYesterday, renamedToday], TODAY)).toBe(
      renamedToday
    )
  })

  it("counts an open end as active", () => {
    const past = dated("1990-01-01", "2000-01-01")
    const open = dated("2015-01-01", null)
    expect(findClosestValidity([past, open], TODAY)).toBe(open)
  })

  it("falls back to the latest past validity, in any order", () => {
    const old = dated("1990-01-01", "1995-01-01")
    const latest = dated("2010-01-01", "2020-01-01")
    const future = dated("2030-01-01", "2035-01-01")
    expect(findClosestValidity([old, latest, future], TODAY)).toBe(latest)
    expect(findClosestValidity([future, latest, old], TODAY)).toBe(latest)
  })

  // The last name an object carried is the expected label, however close the
  // next one is.
  it("prefers the latest past validity over a nearer future one", () => {
    const past = dated("2010-01-01", "2015-01-01")
    const nearFuture = dated("2021-01-01", "2025-01-01")
    expect(findClosestValidity([past, nearFuture], TODAY)).toBe(past)
  })

  it("returns the earliest future validity when there is no past one", () => {
    const near = dated("2025-01-01", "2030-01-01")
    const far = dated("2030-01-01", null)
    expect(findClosestValidity([far, near], TODAY)).toBe(near)
  })

  it("returns the validity with the latest end when the date is cleared", () => {
    const past = dated("1990-01-01", "2000-01-01")
    const latest = dated("2015-01-01", "2025-01-01")
    const open = dated("2030-01-01", null)
    expect(findClosestValidity([past, latest, open], null)).toBe(latest)
  })
})

describe("clampDateToValidity", () => {
  it.each([
    ["inside", "2010-01-01", "2030-01-01", "2020-01-01", "2020-01-01"],
    ["before", "2025-01-01", null, "2020-01-01", "2025-01-01"],
    ["after", "2000-01-01", "2010-01-01", "2020-01-01", "2009-12-31"],
    ["on the exclusive end", "2000-01-01", "2010-01-01", "2010-01-01", "2009-12-31"],
  ])("a date %s the validity", (_, from, to, date, expected) => {
    expect(clampDateToValidity(day(date), validity(from, to)).toString()).toBe(expected)
  })

  it("leaves the date alone in a fully open validity", () => {
    expect(clampDateToValidity(TODAY, { from: null, to: null }).toString()).toBe(
      "2020-01-01"
    )
  })
})

describe("findClosestValidityWithin", () => {
  const row = validity("2010-01-01", null)

  it("returns null without validities", () => {
    expect(findClosestValidityWithin(null, row, TODAY)).toBe(null)
    expect(findClosestValidityWithin([], row, TODAY)).toBe(null)
  })

  it("resolves at the date when the row covers it", () => {
    const oldName = dated("2000-01-01", "2015-01-01")
    const newName = dated("2015-01-01", null)
    expect(findClosestValidityWithin([oldName, newName], row, TODAY)).toBe(newName)
  })

  it("resolves within a past row", () => {
    const duringRow = dated("2000-01-01", "2015-01-01")
    const afterRow = dated("2015-01-01", null)
    const pastRow = validity("2005-01-01", "2010-01-01")
    expect(findClosestValidityWithin([duringRow, afterRow], pastRow, TODAY)).toBe(
      duringRow
    )
  })

  it("resolves within a future row", () => {
    const current = dated("2000-01-01", "2025-01-01")
    const upcoming = dated("2025-01-01", null)
    const futureRow = validity("2026-01-01", null)
    expect(findClosestValidityWithin([current, upcoming], futureRow, TODAY)).toBe(
      upcoming
    )
  })
})

describe("filterValiditiesInRange", () => {
  const names = [
    dated("2000-01-01", "2005-01-01"),
    dated("2005-01-01", "2015-01-01"),
    dated("2015-01-01", null),
  ]
  // `toEqual` cannot tell Temporal values apart, so compare which ones came back.
  const kept = (range: Parameters<typeof filterValiditiesInRange>[1]) =>
    filterValiditiesInRange(names, range).map((name) => names.indexOf(name))

  it("keeps the validities overlapping the range", () => {
    expect(kept(validity("2006-01-01", "2016-01-01"))).toEqual([1, 2])
  })

  it("drops validities that only touch an exclusive end", () => {
    expect(kept(validity("2005-01-01", "2015-01-01"))).toEqual([1])
  })

  it("keeps everything for a fully open range", () => {
    expect(kept({ from: null, to: null })).toEqual([0, 1, 2])
  })

  it("keeps only open ends for a range starting after the others end", () => {
    expect(kept(validity("2020-01-01", null))).toEqual([2])
  })
})

describe("getMinMaxValidities", () => {
  it("returns the earliest `from` and the latest `to`", () => {
    const { from, to } = getMinMaxValidities([
      dated("2021-01-01", "2024-05-01"),
      dated("2020-01-01", "2021-01-01"),
    ])
    expect(from?.toString()).toBe(midnight("2020-01-01").toString())
    expect(to?.toString()).toBe(midnight("2024-05-01").toString())
  })

  it("has no `to` when any validity is open-ended", () => {
    const { to } = getMinMaxValidities([
      dated("2020-01-01", null),
      dated("2021-01-01", "2024-05-01"),
    ])
    expect(to).toBeUndefined()
  })
})

describe("formatQueryDates", () => {
  it("puts both bounds in the query string, with their offsets", () => {
    expect(formatQueryDates(validity("2020-01-01", "2024-05-01"))).toBe(
      "?from=2020-01-01T00%3A00%3A00%2B01%3A00&to=2024-05-01T00%3A00%3A00%2B02%3A00"
    )
  })

  it("leaves out an open end", () => {
    expect(formatQueryDates(validity("2020-01-01", null))).toBe(
      "?from=2020-01-01T00%3A00%3A00%2B01%3A00"
    )
  })
})
