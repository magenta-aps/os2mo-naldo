import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { get } from "svelte/store"

export const tenseToValidity = (
  tense: Tense,
  date: string
): { fromDate: string | null; toDate: string | null } | {} => {
  switch (tense) {
    case "past":
      return { fromDate: null, toDate: date }
    case "present":
      return { fromDate: date }
    case "future":
      return { fromDate: date, toDate: null }
  }
}

export const filterTenseToValidity = (
  tense: Tense,
  date: string
): { from_date: string | null; to_date: string | null } | {} => {
  switch (tense) {
    case "past":
      return { from_date: null, to_date: date }
    case "present":
      return { from_date: date }
    case "future":
      return { from_date: date, to_date: null }
  }
}

// Classifies a whole object across every spell it existed for, rather than one
// validity at a time, so an object MO split on an edit lands in a single tense
// section instead of several at once.
//
// Spells, not one outer span: an object that stopped existing and came back
// would otherwise count as present throughout the gap. `present` therefore
// needs a spell containing the date, and a date falling inside a gap counts as
// past — from there, the last thing that happened is that a spell ended.
//
// Unlike `tenseFilter` this cannot lean on the GraphQL filter having already
// narrowed the set: the caller fetches the object's validities unbounded to see
// the spells. It takes the date as an argument rather than reading the store,
// because the spells are computed, not fetched, and callers have the date.
export const spellTenseFilter = (
  spells: { from?: string | null; to?: string | null }[],
  tense: Tense,
  date: string
) => {
  const day = (value: string | null | undefined) => value?.split("T")[0]
  // `to` is exclusive (v29): `to == date` means the spell ended the day before
  const contains = (spell: { from?: string | null; to?: string | null }) =>
    (!day(spell.from) || date >= day(spell.from)!) &&
    (!day(spell.to) || date < day(spell.to)!)

  switch (tense) {
    case "present":
      return spells.some(contains)
    case "future":
      return (
        !spells.some(contains) && spells.every((s) => !!s.from && date < day(s.from)!)
      )
    case "past":
      return !spells.some(contains) && spells.some((s) => !!s.to && date >= day(s.to)!)
  }
}

export const tenseFilter = (
  obj: { validity: Validity | OpenValidity },
  tense: Tense
) => {
  const globalDate = get(date)
  switch (tense) {
    case "past":
      return globalDate >= obj.validity.to?.split("T")[0]
    case "present":
      return true
    case "future":
      return globalDate < obj.validity.from?.split("T")[0]
  }
}
