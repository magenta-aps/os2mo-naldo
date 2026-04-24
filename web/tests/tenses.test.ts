import { describe, it, expect, beforeEach } from "vitest"
import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
import { date } from "$lib/stores/date"

// In GraphQL v29, `validity.to` is exclusive: it is the first instant AFTER
// the validity ends. A validity ending "yesterday" therefore has
// `to = today`. The boundary must count as past, not as present.
const TODAY = "2020-01-01"
const YESTERDAY = "2019-12-31"
const TOMORROW = "2020-01-02"

const validity = ({ from, to }: { from: string; to: string | null }) => ({
  validity: { from: `${from}T00:00:00+02:00`, to: to ? `${to}T00:00:00+02:00` : null },
})

describe("tenseFilter", () => {
  beforeEach(() => {
    date.set(TODAY)
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
    expect(tenseToValidity("past", TODAY)).toEqual({ fromDate: null, toDate: TODAY })
  })

  it("maps present to today as lower bound only", () => {
    expect(tenseToValidity("present", TODAY)).toEqual({ fromDate: TODAY })
  })

  it("maps future to today as lower bound and null upper bound", () => {
    expect(tenseToValidity("future", TODAY)).toEqual({ fromDate: TODAY, toDate: null })
  })
})
