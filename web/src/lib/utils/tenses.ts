import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { startOfDay } from "$lib/utils/date"
import { get } from "svelte/store"
import { Temporal } from "temporal-polyfill"

export const tenseToValidity = (
  tense: Tense,
  date: Temporal.PlainDate
): { fromDate: Temporal.PlainDate | null; toDate: Temporal.PlainDate | null } | {} => {
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
  date: Temporal.PlainDate
):
  | { from_date: Temporal.PlainDate | null; to_date: Temporal.PlainDate | null }
  | {} => {
  switch (tense) {
    case "past":
      return { from_date: null, to_date: date }
    case "present":
      return { from_date: date }
    case "future":
      return { from_date: date, to_date: null }
  }
}

export const tenseFilter = (
  obj: { validity: Validity | OpenValidity },
  tense: Tense
) => {
  const globalDate = startOfDay(get(date))
  const { from, to } = obj.validity
  switch (tense) {
    case "past":
      return !!to && Temporal.ZonedDateTime.compare(globalDate, to) >= 0
    case "present":
      return true
    case "future":
      return !!from && Temporal.ZonedDateTime.compare(globalDate, from) < 0
  }
}
