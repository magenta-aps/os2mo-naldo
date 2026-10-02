import { startOfDay } from "$lib/utils/date"
import {
  clampDateToValidity,
  filterValiditiesInRange,
  findClosestValidity,
  findClosestValidityWithin,
  formatQueryDates,
  getMinMaxValidities,
} from "$lib/utils/validities"
import { Temporal } from "temporal-polyfill"
import { describe, expect, it } from "vitest"

// In GraphQL v29, `validity.to` is exclusive: `to` is the first moment AFTER
// the validity ends. A validity with `to == filterDate` is NOT active on
// filterDate — its last valid day was the day before.
const TODAY = "2020-01-01"
const TOMORROW = "2020-01-02"

const day = (s: string) => Temporal.PlainDate.from(s)
const validity = (from: string, to: string | null) => ({
  validity: { from: startOfDay(day(from)), to: to ? startOfDay(day(to)) : null },
})

describe("findClosestValidity", () => {
  it("returns the single validity without comparison when only one is given", () => {
    const only = validity("2000-01-01", "2010-01-01")
    expect(findClosestValidity([only], day(TODAY))).toBe(only)
  })

  it("returns the validity active on the filter date", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const active = validity("2015-01-01", "2025-01-01")
    const future = validity("2030-01-01", null)
    expect(findClosestValidity([past, active, future], day(TODAY))).toBe(active)
  })

  it("returns a validity with to == tomorrow as active today (last valid day is today)", () => {
    const endsToday = validity("2015-01-01", TOMORROW)
    const other = validity("2025-01-01", "2030-01-01")
    expect(findClosestValidity([endsToday, other], day(TODAY))).toBe(endsToday)
  })

  it("does not match a validity with to == today as active (ended yesterday — v29 boundary)", () => {
    // Regression test for [#69277]: under v29 exclusive semantics a validity
    // with to == TODAY ended the day before. `endedYesterday` comes back here
    // via the latest-past fallback, as a non-active validity.
    const endedYesterday = validity("2015-01-01", TODAY)
    const other = validity("2025-01-01", "2030-01-01")
    expect(findClosestValidity([endedYesterday, other], day(TODAY))).toBe(
      endedYesterday
    )
  })

  it("returns an open-ended (to=null) validity as active when filter date is on or after from", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const openEnded = validity("2015-01-01", null)
    expect(findClosestValidity([past, openEnded], day(TODAY))).toBe(openEnded)
  })

  it("falls back to the latest past validity when none is active", () => {
    const old = validity("1990-01-01", "1995-01-01")
    const recent = validity("2010-01-01", "2015-01-01")
    const future = validity("2030-01-01", "2035-01-01")
    expect(findClosestValidity([old, recent, future], day(TODAY))).toBe(recent)
  })

  it("prefers the latest past validity over a nearer future one (last known name)", () => {
    // The future validity is much closer in time (1 year vs. 5), yet the last
    // name the object actually carried is still the expected label.
    const past = validity("2010-01-01", "2015-01-01")
    const nearFuture = validity("2021-01-01", "2025-01-01")
    expect(findClosestValidity([past, nearFuture], day(TODAY))).toBe(past)
  })

  it("returns the latest past validity, not the oldest, for a terminated object", () => {
    const oldest = validity("1990-01-01", "1995-01-01")
    const latest = validity("2010-01-01", "2015-01-01")
    expect(findClosestValidity([oldest, latest], day(TODAY))).toBe(latest)
    // Order in the input list must not matter
    expect(findClosestValidity([latest, oldest], day(TODAY))).toBe(latest)
  })

  it("returns the earliest future validity when the object does not exist yet", () => {
    const near = validity("2025-01-01", "2030-01-01")
    const far = validity("2030-01-01", null)
    expect(findClosestValidity([far, near], day(TODAY))).toBe(near)
  })
})

describe("clampDateToValidity", () => {
  it("returns the date unchanged when inside the validity", () => {
    expect(
      clampDateToValidity(
        day(TODAY),
        validity("2010-01-01", "2030-01-01").validity
      ).toString()
    ).toBe(TODAY)
  })

  it("clamps a date before the validity to its first day", () => {
    expect(
      clampDateToValidity(day(TODAY), validity("2025-01-01", null).validity).toString()
    ).toBe("2025-01-01")
  })

  it("clamps a date after the validity to its last valid day (day before exclusive `to`)", () => {
    expect(
      clampDateToValidity(
        day(TODAY),
        validity("2000-01-01", "2010-01-01").validity
      ).toString()
    ).toBe("2009-12-31")
  })

  it("treats a date equal to the exclusive `to` as outside the validity", () => {
    expect(
      clampDateToValidity(
        day("2010-01-01"),
        validity("2000-01-01", "2010-01-01").validity
      ).toString()
    ).toBe("2009-12-31")
  })

  it("returns the date unchanged for a fully open validity", () => {
    expect(clampDateToValidity(day(TODAY), { from: null, to: null }).toString()).toBe(
      TODAY
    )
  })
})

describe("findClosestValidityWithin", () => {
  it("returns null when no validities are given", () => {
    expect(
      findClosestValidityWithin(null, validity("2010-01-01", null).validity, day(TODAY))
    ).toBe(null)
    expect(
      findClosestValidityWithin([], validity("2010-01-01", null).validity, day(TODAY))
    ).toBe(null)
  })

  it("resolves the name valid at the view date when the row covers it", () => {
    const oldName = validity("2000-01-01", "2015-01-01")
    const newName = validity("2015-01-01", null)
    const row = validity("2010-01-01", null).validity
    expect(findClosestValidityWithin([oldName, newName], row, day(TODAY))).toBe(newName)
  })

  it("resolves within a past row instead of at the view date", () => {
    // Row ended 2010 (exclusive `to`); the object was renamed in 2015. The
    // name shown must be the one from the row's own period, not today's.
    const duringRow = validity("2000-01-01", "2015-01-01")
    const afterRow = validity("2015-01-01", null)
    const pastRow = validity("2005-01-01", "2010-01-01").validity
    expect(findClosestValidityWithin([duringRow, afterRow], pastRow, day(TODAY))).toBe(
      duringRow
    )
  })

  it("resolves within a future row instead of at the view date", () => {
    const current = validity("2000-01-01", "2025-01-01")
    const upcoming = validity("2025-01-01", null)
    const futureRow = validity("2026-01-01", null).validity
    expect(findClosestValidityWithin([current, upcoming], futureRow, day(TODAY))).toBe(
      upcoming
    )
  })
})

describe("findClosestValidity with a cleared date", () => {
  it("returns the validity with the latest end instead of throwing", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const latest = validity("2015-01-01", "2025-01-01")
    const open = validity("2030-01-01", null)
    expect(findClosestValidity([past, latest, open], null)).toBe(latest)
  })
})

describe("filterValiditiesInRange", () => {
  const names = [
    validity("2000-01-01", "2005-01-01"),
    validity("2005-01-01", "2015-01-01"),
    validity("2015-01-01", null),
  ]
  // `toEqual` cannot tell Temporal values apart, so compare which ones came back.
  const indexes = (kept: typeof names) => kept.map((v) => names.indexOf(v))

  it("keeps only validities overlapping the range", () => {
    const row = validity("2006-01-01", "2016-01-01").validity
    expect(indexes(filterValiditiesInRange(names, row))).toEqual([1, 2])
  })

  it("excludes validities merely touching the range at an endpoint (exclusive `to`)", () => {
    const row = validity("2005-01-01", "2015-01-01").validity
    expect(indexes(filterValiditiesInRange(names, row))).toEqual([1])
  })

  it("keeps everything for a fully open range", () => {
    expect(indexes(filterValiditiesInRange(names, { from: null, to: null }))).toEqual([
      0, 1, 2,
    ])
  })

  it("keeps open-ended validities for an open-ended range", () => {
    const row = validity("2020-01-01", null).validity
    expect(indexes(filterValiditiesInRange(names, row))).toEqual([2])
  })
})

describe("getMinMaxValidities", () => {
  it("returns the earliest `from` and the latest `to`", () => {
    const { from, to } = getMinMaxValidities([
      validity("2021-01-01", "2024-05-01"),
      validity("2020-01-01", "2021-01-01"),
    ])
    expect(from?.toString()).toBe(startOfDay(day("2020-01-01")).toString())
    expect(to?.toString()).toBe(startOfDay(day("2024-05-01")).toString())
  })

  it("returns no `to` when any validity is open-ended", () => {
    expect(
      getMinMaxValidities([
        validity("2020-01-01", null),
        validity("2021-01-01", "2024-05-01"),
      ]).to
    ).toBeUndefined()
  })
})

describe("formatQueryDates", () => {
  it("puts both bounds in the query string, with their offsets", () => {
    expect(formatQueryDates(validity("2020-01-01", "2024-05-01").validity)).toBe(
      "?from=2020-01-01T00%3A00%3A00%2B01%3A00&to=2024-05-01T00%3A00%3A00%2B02%3A00"
    )
  })

  it("leaves out an open end", () => {
    expect(formatQueryDates(validity("2020-01-01", null).validity)).toBe(
      "?from=2020-01-01T00%3A00%3A00%2B01%3A00"
    )
  })
})
