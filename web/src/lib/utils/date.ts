import { formatInTimeZone } from "date-fns-tz"
import { Temporal } from "temporal-polyfill"

export const formatDate = (date: string): string => {
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy")
}

export const formatDateTime = (date: string): string => {
  if (!date) return ""
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy, HH:mm:ss")
}

const COPENHAGEN = "Europe/Copenhagen"

// A timestamp from MO, e.g. "2024-10-28T00:00:00+01:00", as the same moment in
// Copenhagen. The GraphQL client does this once for every DateTime value.
export const toCopenhagen = (timestamp: string): Temporal.ZonedDateTime => {
  return Temporal.Instant.from(timestamp).toZonedDateTimeISO(COPENHAGEN)
}

// MO takes the offset, not Temporal's "[Europe/Copenhagen]" suffix.
export const toMO = (moment: Temporal.ZonedDateTime): string => {
  return moment.toString({ timeZoneName: "never" })
}

// For libraries that take a Date, such as vis-timeline, and back.
export const toJavaScriptDate = (moment: Temporal.ZonedDateTime): Date => {
  return new Date(moment.epochMilliseconds)
}

export const fromJavaScriptDate = (date: Date): Temporal.ZonedDateTime => {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(
    COPENHAGEN
  )
}

// Today in Copenhagen, the default for the global date.
export const today = (): Temporal.PlainDate => {
  return Temporal.Now.plainDateISO(COPENHAGEN)
}

// Midnight at the start of a day in Copenhagen.
export const startOfDay = (day: Temporal.PlainDate): Temporal.ZonedDateTime => {
  return day.toZonedDateTime(COPENHAGEN)
}

// Svelte counts every assignment of an object as a change, so reactive code
// compares dates with this before assigning. The text holds everything
// `equals` compares: the date and, for a moment, its time and time zone.
export const sameDate = <T extends Temporal.PlainDate | Temporal.ZonedDateTime>(
  a: T | null | undefined,
  b: T | null | undefined
): boolean => {
  return a && b ? a.toString() === b.toString() : a === b
}

// MO only stores validities from midnight to midnight, so anything else fails
// loudly instead of showing the wrong day.
const assertMidnight = (moment: Temporal.ZonedDateTime): Temporal.ZonedDateTime => {
  if (!moment.equals(moment.startOfDay())) {
    throw new Error(`${toMO(moment)} is not at midnight in Copenhagen`)
  }
  return moment
}

// `validity.from` is the first moment an object is valid and `validity.to` the
// first moment it no longer is; users see and pick the first and the last day
// it is valid. The `mo` functions build MO's values from those days.
export const firstValidDay = (
  from: Temporal.ZonedDateTime | null | undefined
): Temporal.PlainDate | null => {
  return from ? assertMidnight(from).toPlainDate() : null
}

export const lastValidDay = (
  to: Temporal.ZonedDateTime | null | undefined
): Temporal.PlainDate | null => {
  return to ? assertMidnight(to).subtract({ days: 1 }).toPlainDate() : null
}

export const moValidityFrom = (
  firstDay: Temporal.PlainDate
): Temporal.ZonedDateTime => {
  return startOfDay(firstDay)
}

export const moValidityTo = (lastDay: Temporal.PlainDate): Temporal.ZonedDateTime => {
  return startOfDay(lastDay.add({ days: 1 }))
}

export const formatDay = (day: Temporal.PlainDate | null): string => {
  return day ? day.toLocaleString("da-DK", { dateStyle: "short" }) : ""
}

export const formatTimestamp = (moment: Temporal.ZonedDateTime): string => {
  return moment.toLocaleString("da-DK", { dateStyle: "short", timeStyle: "short" })
}
