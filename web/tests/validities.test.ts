import { describe, it, expect } from "vitest"
import { findClosestValidity } from "$lib/utils/validities"

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
    // Regression test for [#69277]: the old `>=` check incorrectly treated
    // to == TODAY as still-active. Under v29 exclusive semantics it ended the
    // day before. `endedYesterday` still comes back here, but only via the
    // distance fallback (distance(to, TODAY) == 0), not as the active match.
    const endedYesterday = validity("2015-01-01", TODAY)
    const other = validity("2025-01-01", "2030-01-01")
    expect(findClosestValidity([endedYesterday, other], TODAY)).toBe(endedYesterday)
  })

  it("returns an open-ended (to=null) validity as active when filter date is on or after from", () => {
    const past = validity("1990-01-01", "2000-01-01")
    const openEnded = validity("2015-01-01", null)
    expect(findClosestValidity([past, openEnded], TODAY)).toBe(openEnded)
  })

  it("falls back to the validity closest to the filter date when none is active", () => {
    const old = validity("1990-01-01", "1995-01-01")
    const recent = validity("2010-01-01", "2015-01-01")
    const future = validity("2030-01-01", "2035-01-01")
    expect(findClosestValidity([old, recent, future], TODAY)).toBe(recent)
  })
})
