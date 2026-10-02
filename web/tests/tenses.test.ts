import { date } from "$lib/stores/date"
import { startOfDay } from "$lib/utils/date"
import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
import { Temporal } from "temporal-polyfill"
import { beforeEach, describe, expect, it } from "vitest"

// In GraphQL v29, `validity.to` is exclusive: it is the first moment AFTER
// the validity ends. A validity ending "yesterday" therefore has
// `to = today`. The boundary must count as past, not as present.
const TODAY = "2020-01-01"
const YESTERDAY = "2019-12-31"
const TOMORROW = "2020-01-02"

const day = (s: string) => Temporal.PlainDate.from(s)
const validity = ({ from, to }: { from: string; to: string | null }) => ({
  validity: { from: startOfDay(day(from)), to: to ? startOfDay(day(to)) : null },
})
// The variables as they are sent to MO.
const asSent = (variables: object) => JSON.parse(JSON.stringify(variables))

describe("tenseFilter", () => {
  beforeEach(() => {
    date.set(day(TODAY))
  })

  describe("past", () => {
    it("includes validities that ended well before today", () => {
      expect(
        tenseFilter(validity({ from: "2000-01-01", to: "2010-01-01" }), "past")
      ).toBe(true)
    })

    it("includes validities where to == yesterday (last valid day was two days ago)", () => {
      expect(tenseFilter(validity({ from: "2015-01-01", to: YESTERDAY }), "past")).toBe(
        true
      )
    })

    it("includes validities where to == today (last valid day was yesterday — v29 boundary)", () => {
      // Regression test for [#69277]: the old `>` comparison missed this
      // boundary, so managers that ended the day before "today" were invisible
      // in both the past and present tabs.
      expect(tenseFilter(validity({ from: "2015-01-01", to: TODAY }), "past")).toBe(
        true
      )
    })

    it("excludes validities where to == tomorrow (last valid day is today — still active)", () => {
      expect(tenseFilter(validity({ from: "2015-01-01", to: TOMORROW }), "past")).toBe(
        false
      )
    })

    it("excludes open-ended validities (to = null)", () => {
      expect(tenseFilter(validity({ from: "2015-01-01", to: null }), "past")).toBe(
        false
      )
    })
  })

  describe("present", () => {
    it("always returns true (graphql filter already narrowed to today)", () => {
      expect(tenseFilter(validity({ from: "2015-01-01", to: null }), "present")).toBe(
        true
      )
      expect(
        tenseFilter(validity({ from: "2000-01-01", to: "2010-01-01" }), "present")
      ).toBe(true)
    })
  })

  describe("future", () => {
    it("includes validities starting after today", () => {
      expect(tenseFilter(validity({ from: TOMORROW, to: null }), "future")).toBe(true)
    })

    it("excludes validities starting today (present, not future)", () => {
      expect(tenseFilter(validity({ from: TODAY, to: null }), "future")).toBe(false)
    })

    it("excludes validities already started", () => {
      expect(tenseFilter(validity({ from: "2015-01-01", to: null }), "future")).toBe(
        false
      )
    })
  })
})

describe("tenseToValidity", () => {
  it("maps past to a null lower bound and today as upper bound", () => {
    expect(asSent(tenseToValidity("past", day(TODAY)))).toEqual({
      fromDate: null,
      toDate: TODAY,
    })
  })

  it("maps present to today as lower bound only", () => {
    expect(asSent(tenseToValidity("present", day(TODAY)))).toEqual({ fromDate: TODAY })
  })

  it("maps future to today as lower bound and null upper bound", () => {
    expect(asSent(tenseToValidity("future", day(TODAY)))).toEqual({
      fromDate: TODAY,
      toDate: null,
    })
  })
})
