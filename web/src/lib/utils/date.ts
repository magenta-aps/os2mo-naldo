import { formatInTimeZone } from "date-fns-tz"

export const formatDateTime = (date: string): string => {
  if (!date) return ""
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy, HH:mm:ss")
}

// MO sends validity bounds as timestamps with an offset. Naldo handles them as
// Copenhagen calendar days (yyyy-MM-dd); the GraphQL client converts them once.
export const toCopenhagenDay = (timestamp: string): string => {
  return formatInTimeZone(timestamp, "Europe/Copenhagen", "yyyy-MM-dd")
}

// UTC has no daylight saving time, so stepping a date there moves exactly one
// calendar day.
const addCalendarDays = (day: string, days: number): string => {
  const [year, month, date] = day.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10)
}

// `validity.to` is the first day an object is no longer valid, while users see
// and pick the last valid day: dates shown go through dayBefore, dates picked
// through dayAfter.
export function dayBefore(day: string): string
export function dayBefore(day: string | null | undefined): string | null
export function dayBefore(day: string | null | undefined): string | null {
  return day ? addCalendarDays(day, -1) : null
}

export function dayAfter(day: string): string
export function dayAfter(day: string | null | undefined): string | null
export function dayAfter(day: string | null | undefined): string | null {
  return day ? addCalendarDays(day, 1) : null
}

export const formatDay = (day: string): string => {
  const [year, month, date] = day.split("-")
  return `${date}-${month}-${year}`
}
