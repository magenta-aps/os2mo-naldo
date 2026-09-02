import {
  clampDateToValidity,
  filterValiditiesInRange,
  findClosestValidityWithin,
  findClosestValidity,
} from "$lib/utils/validities"
import { describe, expect, it } from "vitest"

// In GraphQL v29, `validity.to` is exclusive: `to` is the first instant AFTER
// the validity ends. A validity with `to == filterDate` is NOT active on
// filterDate — its last valid day was the day before.
const TODAY = "2020-01-01"
const TOMORROW = "2020-01-02"

const validity = (from: string, to: string | null) => ({
  validity: { from: `${from}T00:00:00+02:00`, to: to ? `${to}T00:00:00+02:00` : null },
})

describe("findClosestValidity", () => {
  it("returns the single validity without comparison when only one is given", () => {
    const only = validity("2000-01-01", "2010-01-01")
    expect(findClosestValidity([only], TODAY)).toBe(only)
  })

  it("returns the validity active on the filter date", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const active = validity("2015-01-01", "2025-01-01")
    const future = validity("2030-01-01", null)
    expect(findClosestValidity([past, active, future], TODAY)).toBe(active)
  })

  it("returns a validity with to == tomorrow as active today (last valid day is today)", () => {
    const endsToday = validity("2015-01-01", TOMORROW)
    const other = validity("2025-01-01", "2030-01-01")
    expect(findClosestValidity([endsToday, other], TODAY)).toBe(endsToday)
  })

  it("does not match a validity with to == today as active (ended yesterday — v29 boundary)", () => {
    // Regression test for [#69277]: under v29 exclusive semantics a validity
    // with to == TODAY ended the day before. `endedYesterday` comes back here
    // via the latest-past fallback, as a non-active validity.
    const endedYesterday = validity("2015-01-01", TODAY)
    const other = validity("2025-01-01", "2030-01-01")
    expect(findClosestValidity([endedYesterday, other], TODAY)).toBe(endedYesterday)
  })

  it("returns an open-ended (to=null) validity as active when filter date is on or after from", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const openEnded = validity("2015-01-01", null)
    expect(findClosestValidity([past, openEnded], TODAY)).toBe(openEnded)
  })

  it("falls back to the latest past validity when none is active", () => {
    const old = validity("1990-01-01", "1995-01-01")
    const recent = validity("2010-01-01", "2015-01-01")
    const future = validity("2030-01-01", "2035-01-01")
    expect(findClosestValidity([old, recent, future], TODAY)).toBe(recent)
  })

  it("prefers the latest past validity over a nearer future one (last known name)", () => {
    // The future validity is much closer in time (1 year vs. 5), yet the last
    // name the object actually carried is still the expected label.
    const past = validity("2010-01-01", "2015-01-01")
    const nearFuture = validity("2021-01-01", "2025-01-01")
    expect(findClosestValidity([past, nearFuture], TODAY)).toBe(past)
  })

  it("returns the latest past validity, not the oldest, for a terminated object", () => {
    const oldest = validity("1990-01-01", "1995-01-01")
    const latest = validity("2010-01-01", "2015-01-01")
    expect(findClosestValidity([oldest, latest], TODAY)).toBe(latest)
    // Order in the input list must not matter
    expect(findClosestValidity([latest, oldest], TODAY)).toBe(latest)
  })

  it("returns the earliest future validity when the object does not exist yet", () => {
    const near = validity("2025-01-01", "2030-01-01")
    const far = validity("2030-01-01", null)
    expect(findClosestValidity([far, near], TODAY)).toBe(near)
  })
})

describe("clampDateToValidity", () => {
  it("returns the date unchanged when inside the validity", () => {
    expect(
      clampDateToValidity(TODAY, validity("2010-01-01", "2030-01-01").validity)
    ).toBe(TODAY)
  })

  it("clamps a date before the validity to its first day", () => {
    expect(clampDateToValidity(TODAY, validity("2025-01-01", null).validity)).toBe(
      "2025-01-01"
    )
  })

  it("clamps a date after the validity to its last valid day (day before exclusive `to`)", () => {
    expect(
      clampDateToValidity(TODAY, validity("2000-01-01", "2010-01-01").validity)
    ).toBe("2009-12-31")
  })

  it("treats a date equal to the exclusive `to` as outside the validity", () => {
    expect(
      clampDateToValidity("2010-01-01", validity("2000-01-01", "2010-01-01").validity)
    ).toBe("2009-12-31")
  })

  it("returns the date unchanged for a fully open validity", () => {
    expect(clampDateToValidity(TODAY, { from: null, to: null })).toBe(TODAY)
  })
})

describe("findClosestValidityWithin", () => {
  it("returns null when no validities are given", () => {
    expect(
      findClosestValidityWithin(null, validity("2010-01-01", null).validity, TODAY)
    ).toBe(null)
    expect(
      findClosestValidityWithin([], validity("2010-01-01", null).validity, TODAY)
    ).toBe(null)
  })

  it("resolves the name valid at the view date when the row covers it", () => {
    const oldName = validity("2000-01-01", "2015-01-01")
    const newName = validity("2015-01-01", null)
    const row = validity("2010-01-01", null).validity
    expect(findClosestValidityWithin([oldName, newName], row, TODAY)).toBe(newName)
  })

  it("resolves within a past row instead of at the view date", () => {
    // Row ended 2010 (exclusive `to`); the object was renamed in 2015. The
    // name shown must be the one from the row's own period, not today's.
    const duringRow = validity("2000-01-01", "2015-01-01")
    const afterRow = validity("2015-01-01", null)
    const pastRow = validity("2005-01-01", "2010-01-01").validity
    expect(findClosestValidityWithin([duringRow, afterRow], pastRow, TODAY)).toBe(
      duringRow
    )
  })

  it("resolves within a future row instead of at the view date", () => {
    const current = validity("2000-01-01", "2025-01-01")
    const upcoming = validity("2025-01-01", null)
    const futureRow = validity("2026-01-01", null).validity
    expect(findClosestValidityWithin([current, upcoming], futureRow, TODAY)).toBe(
      upcoming
    )
  })
})

describe("filterValiditiesInRange", () => {
  const names = [
    validity("2000-01-01", "2005-01-01"),
    validity("2005-01-01", "2015-01-01"),
    validity("2015-01-01", null),
  ]

  it("keeps only validities overlapping the range", () => {
    const row = validity("2006-01-01", "2016-01-01").validity
    expect(filterValiditiesInRange(names, row)).toEqual([names[1], names[2]])
  })

  it("excludes validities merely touching the range at an endpoint (exclusive `to`)", () => {
    const row = validity("2005-01-01", "2015-01-01").validity
    expect(filterValiditiesInRange(names, row)).toEqual([names[1]])
  })

  it("keeps everything for a fully open range", () => {
    expect(filterValiditiesInRange(names, { from: null, to: null })).toEqual(names)
  })

  it("keeps open-ended validities for an open-ended range", () => {
    const row = validity("2020-01-01", null).validity
    expect(filterValiditiesInRange(names, row)).toEqual([names[2]])
  })
})
