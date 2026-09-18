import type { OpenValidity, Validity } from "$lib/graphql/types"
import { isEqual, parseISO } from "date-fns"

// One column of a table row: its heading, and the value this validity shows
// under it. Callers return them in column order, so a change can name itself
// without a second lookup table to keep in step.
export type Field = { label: string; value: string | null | undefined }

export type Change = {
  label: string
  from: string | null | undefined
  to: string | null | undefined
}

export type Period<T> = {
  // The validity this period's values were read from
  object: T
  // Spans every slice folded into this period, so it is wider than
  // `object.validity` when identical slices were merged
  validity: OpenValidity
  // What the row displays throughout this period, in column order
  fields: Field[]
  // null on the first period of a spell: there is nothing before it to differ
  // from. It marks where the spell starts, not when the object was registered —
  // that is a registration-time fact, and this is a validity-time view.
  changes: Change[] | null
}

type Dated = { validity: OpenValidity | Validity }

// Two validities meet exactly. `to` is exclusive (v29), so the earlier one's
// `to` is the later one's `from`. Compared as instants, not strings: two
// contiguous slices may spell the same boundary with different offsets.
const isAdjacent = (before: OpenValidity | Validity, after: OpenValidity | Validity) =>
  !!before.to && !!after.from && isEqual(parseISO(before.to), parseISO(after.from))

const byStart = (a: Dated, b: Dated) =>
  (a.validity.from ?? "").localeCompare(b.validity.from ?? "")

// Paired by position: both sides come from the same function, so column `i` is
// the same column on either side. `undefined` and `null` both mean "not set".
const diff = (before: Field[], after: Field[]): Change[] =>
  after
    .map((field, i) => ({
      label: field.label,
      from: before[i]?.value,
      to: field.value,
    }))
    .filter((change) => (change.from ?? null) !== (change.to ?? null))

// Splits validities wherever the object stopped existing. A gap is not a
// change, it is two separate spells: a caller that spans both would claim the
// object was there throughout. Spells come back oldest first, each sorted.
export const splitOnGaps = <T extends Dated>(validities: T[]): T[][] => {
  const spells: T[][] = []

  for (const object of [...validities].sort(byStart)) {
    const spell = spells[spells.length - 1]
    const previous = spell?.[spell.length - 1]

    if (spell && previous && isAdjacent(previous.validity, object.validity)) {
      spell.push(object)
    } else {
      spells.push([object])
    }
  }

  return spells
}

// MO splits a validity on every change, including changes to fields a given
// table does not show. Folds those slices back into the periods a user would
// recognise: consecutive slices that touch and carry identical displayed values
// become one period. Returns them oldest first.
//
// Slices separated by a gap are never folded together, however alike they are.
// Pass one spell at a time (see `splitOnGaps`) to keep each spell's history self
// contained — otherwise the period after a gap reports a diff against values
// from before it, describing a change that happened while the object was gone.
export const toPeriods = <T extends Dated>(
  validities: T[],
  fields: (object: T) => Field[]
): Period<T>[] => {
  const periods: Period<T>[] = []
  let previous: Field[] | undefined

  for (const object of [...validities].sort(byStart)) {
    const current = fields(object)
    const last = periods[periods.length - 1]

    if (
      last &&
      previous &&
      isAdjacent(last.validity, object.validity) &&
      diff(previous, current).length === 0
    ) {
      last.validity = { ...last.validity, to: object.validity.to }
      continue
    }

    periods.push({
      object,
      validity: { from: object.validity.from, to: object.validity.to },
      fields: current,
      changes: previous ? diff(previous, current) : null,
    })
    previous = current
  }

  return periods
}
