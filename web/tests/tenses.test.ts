import { date } from "$lib/stores/date"
import { spellTenseFilter, tenseFilter, tenseToValidity } from "$lib/utils/tenses"
import { beforeEach, describe, expect, it } from "vitest"

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

describe("spellTenseFilter", () => {
  const spell = (from: string | null, to: string | null) => ({ from, to })

  describe("one spell", () => {
    it("is past once it has ended", () => {
      expect(spellTenseFilter([spell("2000-01-01", "2010-01-01")], "past", TODAY)).toBe(
        true
      )
    })

    it("is past when to == today (it ended the day before)", () => {
      expect(spellTenseFilter([spell("2000-01-01", TODAY)], "past", TODAY)).toBe(true)
    })

    it("is present when to == tomorrow (its last day is today)", () => {
      expect(spellTenseFilter([spell("2000-01-01", TOMORROW)], "present", TODAY)).toBe(
        true
      )
    })

    it("is present while open-ended and started", () => {
      expect(spellTenseFilter([spell("2000-01-01", null)], "present", TODAY)).toBe(true)
    })

    it("is future before it starts", () => {
      expect(spellTenseFilter([spell(TOMORROW, null)], "future", TODAY)).toBe(true)
    })
  })

  // The reason this reads spells rather than one outer span: an object that
  // stopped existing and came back must not count as present through the gap.
  describe("a gap between two spells", () => {
    const gapped = [spell("2015-01-01", "2019-01-01"), spell("2025-01-01", null)]

    it("is present while the later spell is running", () => {
      expect(spellTenseFilter(gapped, "present", "2026-01-01")).toBe(true)
    })

    it("is present while the earlier spell is running", () => {
      expect(spellTenseFilter(gapped, "present", "2016-01-01")).toBe(true)
    })

    it("is not present on a date inside the gap", () => {
      expect(spellTenseFilter(gapped, "present", "2020-01-01")).toBe(false)
    })

    it("is past on a date inside the gap, where a spell has ended", () => {
      expect(spellTenseFilter(gapped, "past", "2020-01-01")).toBe(true)
    })

    it("is not future on a date inside the gap", () => {
      expect(spellTenseFilter(gapped, "future", "2020-01-01")).toBe(false)
    })

    it("is future before either spell starts", () => {
      expect(spellTenseFilter(gapped, "future", "2010-01-01")).toBe(true)
    })
  })

  // One row per engagement: whatever its shape, it belongs to exactly one section
  it("puts an object in exactly one section, gap or no gap", () => {
    const cases = [
      [spell("2015-01-01", null)],
      [spell("2015-01-01", "2019-01-01"), spell("2025-01-01", null)],
      [spell("2015-01-01", "2019-01-01")],
      [spell(TOMORROW, null)],
    ]
    for (const spells of cases) {
      for (const on of [TODAY, "2020-01-01", "2016-01-01", "2030-01-01"]) {
        const sections = (["past", "present", "future"] as Tense[]).filter((tense) =>
          spellTenseFilter(spells, tense, on)
        )
        expect(sections).toHaveLength(1)
      }
    }
  })
})
