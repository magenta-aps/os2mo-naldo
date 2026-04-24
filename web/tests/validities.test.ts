import { describe, it, expect } from "vitest"
import { anchorFor } from "$lib/utils/validities"

// `anchorFor` clamps `today` into a row's own validity window so past rows
// resolve nested names at role end, present rows at today, future rows at
// role start.
//
// Under v29 exclusive-to semantics, a row with `to == today` ended yesterday
// — it IS past.
const TODAY = "2020-01-01"

const row = (from: string | null, to: string | null) => ({
  from: from ? `${from}T00:00:00+02:00` : null,
  to: to ? `${to}T00:00:00+02:00` : null,
})

describe("anchorFor", () => {
  describe("past rows (today >= validity.to)", () => {
    it("anchors at validity.to when row ended long ago", () => {
      const v = row("2000-01-01", "2010-01-01")
      expect(anchorFor(v as any, TODAY)).toBe(v.to)
    })

    it("anchors at validity.to when to == today (v29 boundary — ended yesterday)", () => {
      // Regression test for the v29 exclusive-to boundary: a row with
      // to == today ended the day before today and must anchor at `to`.
      const v = row("2015-01-01", TODAY)
      expect(anchorFor(v as any, TODAY)).toBe(v.to)
    })
  })

  describe("present rows (validity.from <= today < validity.to)", () => {
    it("anchors at today for a bounded present row", () => {
      const v = row("2015-01-01", "2025-01-01")
      expect(anchorFor(v as any, TODAY)).toBe(TODAY)
    })

    it("anchors at today for an open-ended present row (to = null)", () => {
      const v = row("2015-01-01", null)
      expect(anchorFor(v as any, TODAY)).toBe(TODAY)
    })

    it("anchors at today when from == today (from is inclusive)", () => {
      const v = row(TODAY, "2025-01-01")
      expect(anchorFor(v as any, TODAY)).toBe(TODAY)
    })
  })

  describe("future rows (today < validity.from)", () => {
    it("anchors at validity.from for a bounded future row", () => {
      const v = row("2025-01-01", "2030-01-01")
      expect(anchorFor(v as any, TODAY)).toBe(v.from)
    })

    it("anchors at validity.from for an open-ended future row", () => {
      const v = row("2025-01-01", null)
      expect(anchorFor(v as any, TODAY)).toBe(v.from)
    })
  })
})
