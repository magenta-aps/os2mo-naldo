import { addDays, format, parseISO } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"

export const formatDate = (date: string): string => {
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy")
}

export const formatDateTime = (date: string): string => {
  if (!date) return ""
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy, HH:mm:ss")
}

// GraphQL v29 `validity.to` is exclusive; users read and type the last valid
// day. Convert only where dates are shown or entered. The last valid day is the
// Copenhagen date of the instant before `to`.
const lastValidInstant = (to: string): Date => new Date(parseISO(to).getTime() - 1)

export const lastValidDay = (to: string | null | undefined): string | null => {
  if (!to) return null
  return formatInTimeZone(lastValidInstant(to), "Europe/Copenhagen", "yyyy-MM-dd")
}

export const formatLastValidDay = (to: string): string => {
  return formatInTimeZone(lastValidInstant(to), "Europe/Copenhagen", "dd-MM-yyyy")
}

// `day` is a yyyy-MM-dd last valid day, as a date input produces it. MO rejects
// a `to` that is not at midnight, so this steps a whole day.
export const exclusiveTo = (day: string | null | undefined): string | null => {
  if (!day) return null
  return format(addDays(parseISO(day), 1), "yyyy-MM-dd")
}
