import { formatInTimeZone } from "date-fns-tz"

export const formatDate = (date: string): string => {
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy")
}

export const formatDateTime = (date: string): string => {
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy, HH:mm:ss")
}
