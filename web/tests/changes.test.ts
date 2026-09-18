import { splitOnGaps, toPeriods, type Field } from "$lib/utils/changes"
import { describe, expect, it } from "vitest"

// In GraphQL v29, `validity.to` is exclusive, so two contiguous slices share a
// boundary: the first one's `to` is the second one's `from`.
// Columns in order, as a table's `fields` returns them
const at = (values: Record<string, string | null | undefined>): Field[] =>
  Object.entries(values).map(([label, value]) => ({ label, value }))

const slice = (
  from: string,
  to: string | null,
  values: Record<string, string | null | undefined>
) => ({
  validity: { from: `${from}T00:00:00+02:00`, to: to ? `${to}T00:00:00+02:00` : null },
  fields: at(values),
})

const fields = (object: { fields: Field[] }) => object.fields

describe("toPeriods", () => {
  it("reports the first period as the creation, with no changes", () => {
    const periods = toPeriods([slice("2019-01-01", null, { job: "Clerk" })], fields)

    expect(periods).toHaveLength(1)
    expect(periods[0].changes).toBe(null)
  })

  it("names the field that changed between two slices", () => {
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { job: "Clerk", unit: "Service" }),
        slice("2023-01-01", null, { job: "Adviser", unit: "Service" }),
      ],
      fields
    )

    expect(periods).toHaveLength(2)
    expect(periods[1].changes).toEqual([{ label: "job", from: "Clerk", to: "Adviser" }])
  })

  it("reports every field that changed at the same boundary", () => {
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { job: "Clerk", unit: "Service" }),
        slice("2023-01-01", null, { job: "Adviser", unit: "Health" }),
      ],
      fields
    )

    expect(periods[1].changes).toEqual([
      { label: "job", from: "Clerk", to: "Adviser" },
      { label: "unit", from: "Service", to: "Health" },
    ])
  })

  it("sorts slices that arrive out of order", () => {
    const periods = toPeriods(
      [
        slice("2023-01-01", null, { job: "Adviser" }),
        slice("2019-01-01", "2023-01-01", { job: "Clerk" }),
      ],
      fields
    )

    expect(periods.map((period) => period.object.fields[0].value)).toEqual([
      "Clerk",
      "Adviser",
    ])
    expect(periods[0].changes).toBe(null)
  })

  it("folds adjacent slices whose displayed values are identical", () => {
    // MO split this engagement on a field the table does not show. With nothing
    // visible to report, the two slices are one period.
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { job: "Clerk" }),
        slice("2023-01-01", "2025-01-01", { job: "Clerk" }),
      ],
      fields
    )

    expect(periods).toHaveLength(1)
    expect(periods[0].validity.from).toContain("2019-01-01")
    expect(periods[0].validity.to).toContain("2025-01-01")
  })

  it("keeps identical slices apart when a gap separates them", () => {
    // The gap is the engagement not existing, which is not nothing.
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { job: "Clerk" }),
        slice("2024-01-01", null, { job: "Clerk" }),
      ],
      fields
    )

    expect(periods).toHaveLength(2)
    expect(periods[1].changes).toEqual([])
  })

  it("treats null and undefined as the same unset value", () => {
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { job: "Clerk", code: null }),
        slice("2023-01-01", null, { job: "Clerk", code: undefined }),
      ],
      fields
    )

    expect(periods).toHaveLength(1)
  })

  it("reports a field becoming set as a change", () => {
    const periods = toPeriods(
      [
        slice("2019-01-01", "2023-01-01", { code: null }),
        slice("2023-01-01", null, { code: "A4" }),
      ],
      fields
    )

    expect(periods[1].changes).toEqual([{ label: "code", from: null, to: "A4" }])
  })
})

describe("splitOnGaps", () => {
  it("keeps contiguous validities in one run", () => {
    const runs = splitOnGaps([
      slice("2019-01-01", "2023-01-01", {}),
      slice("2023-01-01", null, {}),
    ])

    expect(runs).toHaveLength(1)
    expect(runs[0]).toHaveLength(2)
  })

  it("starts a new run at a gap", () => {
    const runs = splitOnGaps([
      slice("2019-01-01", "2023-01-01", {}),
      slice("2025-01-01", null, {}),
    ])

    expect(runs.map((run) => run.length)).toEqual([1, 1])
    expect(runs[0][0].validity.from).toContain("2019-01-01")
    expect(runs[1][0].validity.from).toContain("2025-01-01")
  })

  it("sorts before splitting, so input order cannot invent a gap", () => {
    const runs = splitOnGaps([
      slice("2023-01-01", null, {}),
      slice("2019-01-01", "2023-01-01", {}),
    ])

    expect(runs).toHaveLength(1)
  })

  it("treats an open-ended validity as unable to be followed", () => {
    // Nothing can be adjacent to a validity that never ends
    const runs = splitOnGaps([
      slice("2019-01-01", null, {}),
      slice("2025-01-01", null, {}),
    ])

    expect(runs).toHaveLength(2)
  })

  it("returns one run for a single validity", () => {
    expect(splitOnGaps([slice("2019-01-01", null, {})])).toHaveLength(1)
  })

  // The regression this exists for: an engagement that left a unit and came
  // back would otherwise be one row spanning the time it was elsewhere.
  it("gives each spell its own periods, with its own start", () => {
    const runs = splitOnGaps([
      slice("2019-01-01", "2023-01-01", { job: "Clerk" }),
      slice("2025-01-01", null, { job: "Adviser" }),
    ])
    const periods = runs.map((run) => toPeriods(run, fields))

    expect(periods.map((run) => run.length)).toEqual([1, 1])
    // Neither spell reports a diff against the other across the gap
    expect(periods[0][0].changes).toBe(null)
    expect(periods[1][0].changes).toBe(null)
  })
})
