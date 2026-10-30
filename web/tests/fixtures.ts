import { jsonSerializer } from "$lib/http/dateTimes"
import { startOfDay } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"

export const day = (s: string) => Temporal.PlainDate.from(s)

// Midnight in Copenhagen, the way MO sends validity bounds.
export const midnight = (s: string) => startOfDay(day(s))

// A validity as GraphQL v29 returns it: `to` is exclusive, so a validity whose
// last valid day is 2020-01-01 has `to` 2020-01-02.
export const validity = (from: string, to: string | null) => ({
  from: midnight(from),
  to: to ? midnight(to) : null,
})

// An object carrying a validity.
export const dated = (from: string, to: string | null) => ({
  validity: validity(from, to),
})

// A value as it is sent to MO, with its timestamps written out.
export const sent = (value: unknown) => JSON.parse(jsonSerializer.stringify(value))
