import { describe, it, expect } from "vitest"
import { json2csv } from "$lib/utils/csv"
import type { Field, SelectedQuery } from "$lib/utils/insights"

// Helper: build a Field with simple, data-local getHeaders/getValues so the
// tests stay independent of svelte-i18n. `getValues` pulls from a fixed key
// on its row argument; `getHeaders` returns a fixed set of column labels.
const field = (headers: string[], pick: (row: any) => string[]): Field => ({
  label: headers.join("|"),
  query: "",
  getHeaders: () => headers,
  getValues: (row) => pick(row),
})

const query = (operation: string, chosenFields: Field[]): SelectedQuery => ({
  mainQuery: { operation, filter: "", label: "", fields: chosenFields },
  chosenFields,
})

const SEP = ";"
const lines = (csv: string) => csv.split("\n")

describe("json2csv", () => {
  it("returns header row only when data is empty", () => {
    const q = query("org_units", [field(["Name"], (r) => [r.name])])
    expect(json2csv([], [q])).toBe("Name")
  })

  it("emits org-units-only rows when no subqueries are selected (Case A)", () => {
    const q = query("org_units", [field(["Name"], (r) => [r.name])])
    const csv = json2csv([{ name: "Unit A" }, { name: "Unit B" }], [q])
    expect(lines(csv)).toEqual(["Name", "Unit A", "Unit B"])
  })

  it("forces org_units columns first regardless of selection order", () => {
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const engQ = query("engagements", [field(["Job"], (r) => [r.job])])
    const csv = json2csv(
      [{ name: "U1", uuid: "u1", engagements: [{ org_unit_uuid: "u1", job: "A" }] }],
      [engQ, ouQ] // note: engagement first in the UI selection
    )
    // Header order: Unit, Job (org_units promoted to front)
    expect(lines(csv)[0]).toBe(["Unit", "Job"].join(SEP))
  })

  it("flattens subquery items into rows and repeats org_unit columns (Case B)", () => {
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const engQ = query("engagements", [field(["Job"], (r) => [r.job])])
    const csv = json2csv(
      [
        {
          name: "U1",
          uuid: "u1",
          engagements: [
            { org_unit_uuid: "u1", job: "A" },
            { org_unit_uuid: "u1", job: "B" },
          ],
        },
      ],
      [ouQ, engQ]
    )
    expect(lines(csv)).toEqual([
      ["Unit", "Job"].join(SEP),
      ["U1", "A"].join(SEP),
      ["U1", "B"].join(SEP),
    ])
  })

  it("emits one empty-subquery row per unit when the subquery has no items", () => {
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const engQ = query("engagements", [field(["Job"], (r) => [r.job])])
    const csv = json2csv([{ name: "U1", uuid: "u1", engagements: [] }], [ouQ, engQ])
    expect(lines(csv)).toEqual([["Unit", "Job"].join(SEP), ["U1", ""].join(SEP)])
  })

  it("skips subquery items whose org_unit_uuid does not match the current unit", () => {
    // Guards against items that were moved to another unit and shouldn't
    // appear again under their original home.
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const engQ = query("engagements", [field(["Job"], (r) => [r.job])])
    const csv = json2csv(
      [
        {
          name: "U1",
          uuid: "u1",
          engagements: [
            { org_unit_uuid: "u1", job: "kept" },
            { org_unit_uuid: "other", job: "moved-away" },
          ],
        },
      ],
      [ouQ, engQ]
    )
    const rows = lines(csv).slice(1)
    expect(rows).toEqual([["U1", "kept"].join(SEP)])
  })

  it("always emits related_units rows regardless of org_unit_uuid", () => {
    // Carve-out for related_units — no move-filter applies.
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const rel = query("related_units", [field(["Rel"], (r) => [r.name])])
    const csv = json2csv(
      [
        {
          name: "U1",
          uuid: "u1",
          related_units: [{ name: "R1" /* no org_unit_uuid match */ }],
        },
      ],
      [ouQ, rel]
    )
    expect(lines(csv).slice(1)).toEqual([["U1", "R1"].join(SEP)])
  })

  it("unwraps itusers from engagements[].it[].itusers[].current", () => {
    // Special-case: IT Users are nested inside an aliased `it` array under
    // each engagement; json2csv flattens wrappers and injects org_unit_uuid.
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const ituQ = query("itusers", [field(["Login"], (r) => [r.user_key])])
    const csv = json2csv(
      [
        {
          name: "U1",
          uuid: "u1",
          it: [
            {
              itusers: [
                { current: { user_key: "alice" } },
                { current: null }, // should be dropped
                { current: { user_key: "bob" } },
              ],
            },
          ],
        },
      ],
      [ouQ, ituQ]
    )
    expect(lines(csv).slice(1)).toEqual([
      ["U1", "alice"].join(SEP),
      ["U1", "bob"].join(SEP),
    ])
  })

  it("emits an empty itusers row when engagements exist but have no it", () => {
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const ituQ = query("itusers", [field(["Login"], (r) => [r.user_key])])
    const csv = json2csv([{ name: "U1", uuid: "u1" /* no `it` */ }], [ouQ, ituQ])
    expect(lines(csv).slice(1)).toEqual([["U1", ""].join(SEP)])
  })

  it("pads columns of non-active subqueries with empty cells", () => {
    // When an item belongs to subquery A, subquery B's columns on that row
    // must be blank so CSV columns stay aligned with headers.
    const ouQ = query("org_units", [field(["Unit"], (r) => [r.name])])
    const engQ = query("engagements", [field(["Job"], (r) => [r.job])])
    const addrQ = query("addresses", [field(["Addr"], (r) => [r.value])])
    const csv = json2csv(
      [
        {
          name: "U1",
          uuid: "u1",
          engagements: [{ org_unit_uuid: "u1", job: "J" }],
          addresses: [{ org_unit_uuid: "u1", value: "Main St" }],
        },
      ],
      [ouQ, engQ, addrQ]
    )
    expect(lines(csv)).toEqual([
      ["Unit", "Job", "Addr"].join(SEP),
      ["U1", "J", ""].join(SEP),
      ["U1", "", "Main St"].join(SEP),
    ])
  })

  it("quotes and escapes values containing separator, newline, or quotes", () => {
    const ouQ = query("org_units", [field(["Col"], (r) => [r.val])])
    const cases = [
      { val: "has;semi" },
      { val: "has\nnewline" },
      { val: 'has"quote' },
      { val: "plain" },
    ]
    // Note: the embedded newline makes a naive split("\n") unsafe, so we
    // compare the whole output instead.
    const csv = json2csv(cases, [ouQ])
    expect(csv).toBe(
      ["Col", '"has;semi"', '"has\nnewline"', '"has""quote"', "plain"].join("\n")
    )
  })

  it("renders null and undefined field values as empty cells", () => {
    const ouQ = query("org_units", [field(["Col"], (r) => [r.val])])
    const csv = json2csv([{ val: null }, { val: undefined }, { val: "x" }], [ouQ])
    expect(lines(csv).slice(1)).toEqual(["", "", "x"])
  })

  it("pads getValues arrays shorter than getHeaders to match column count", () => {
    const ouQ = query("org_units", [
      {
        label: "multi",
        query: "",
        // Two headers but getValues returns only one value → padded with ""
        getHeaders: () => ["A", "B"],
        getValues: () => ["only-a"],
      },
    ])
    const csv = json2csv([{}], [ouQ])
    expect(lines(csv)).toEqual([["A", "B"].join(SEP), ["only-a", ""].join(SEP)])
  })
})
