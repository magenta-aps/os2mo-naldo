import { formatInTimeZone } from "date-fns-tz"

export const formatDate = (date: string): string => {
  return formatInTimeZone(date, "Europe/Copenhagen", "dd-MM-yyyy")
}
