import { date } from "$lib/stores/date"
import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
import { beforeEach, describe, expect, it } from "vitest"
import { dated, day, sent } from "./fixtures"

const TODAY = "2020-01-01"

describe("tenseFilter", () => {
  beforeEach(() => {
    date.set(day(TODAY))
  })

  // `to` is exclusive: `to` == today means the last valid day was yesterday.
  it.each([
    ["2000-01-01", "2010-01-01", "past", true],
    ["2015-01-01", "2019-12-31", "past", true],
    ["2015-01-01", "2020-01-01", "past", true],
    ["2015-01-01", "2020-01-02", "past", false],
    ["2015-01-01", null, "past", false],
    // The query already narrows present to today, so the filter keeps it all.
    ["2015-01-01", null, "present", true],
    ["2000-01-01", "2010-01-01", "present", true],
    ["2020-01-02", null, "future", true],
    ["2020-01-01", null, "future", false],
    ["2015-01-01", null, "future", false],
  ] as const)("%s to %s is %s: %s", (from, to, tense, expected) => {
    expect(tenseFilter(dated(from, to), tense)).toBe(expected)
  })
})

describe("tenseToValidity", () => {
  it.each([
    ["past", { fromDate: null, toDate: TODAY }],
    ["present", { fromDate: TODAY }],
    ["future", { fromDate: TODAY, toDate: null }],
  ] as const)("bounds %s by today", (tense, expected) => {
    expect(sent(tenseToValidity(tense, day(TODAY)))).toEqual(expected)
  })
})
