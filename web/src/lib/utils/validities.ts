import {
  format,
  isValid,
  parseISO,
  formatISO,
  addSeconds,
  differenceInCalendarDays,
} from "date-fns"
import type { OpenValidity, Validity } from "$lib/graphql/types"

export const getMinMaxValidities = (
  validities: { validity: Validity | OpenValidity }[] | undefined | null
) => {
  // This handles optional person/org_unit validities
  // Changed this from error to warning, since this isn't always an error
  // For example when we create objects without specifying uuid (org_unit and leave)
  if (!validities) {
    console.warn("Validities are null or undefined")
    return {
      from: undefined,
      to: undefined,
    }
  }

  let minDate
  let maxDate

  for (const validity of validities) {
    const fromDate = parseISO(validity.validity.from)
    const toDate = validity.validity.to ? parseISO(validity.validity.to) : null

    if (isValid(fromDate) && (!minDate || fromDate < minDate)) {
      minDate = fromDate
    }

    if (!isValid(toDate) || maxDate === null) {
      maxDate = null
    } else if (maxDate === undefined || toDate! > maxDate) {
      maxDate = toDate
    }
  }
  return {
    from: minDate ? format(minDate, "yyyy-MM-dd") : undefined,
    to: maxDate ? format(maxDate, "yyyy-MM-dd") : undefined,
  }
}

export const formatQueryDates = (validity: Validity | OpenValidity): string => {
  const from = parseISO(validity.from)
  let to = parseISO(validity.to)

  // TODO: Workaround for sus backend behaviour (https://redmine.magenta.dk/issues/61001)
  if (to.getTime() === from.getTime()) {
    to = addSeconds(to, 1)
  }

  // If date is not valid, set to null (we never return null, it's just to make it clearer than an empty string)
  const formattedFrom = isValid(from)
    ? `from=${encodeURIComponent(formatISO(from, { representation: "complete" }))}`
    : null
  const formattedTo = isValid(to)
    ? `to=${encodeURIComponent(formatISO(to, { representation: "complete" }))}`
    : null

  if (!formattedFrom && !formattedTo) {
    return ""
  }

  if (formattedFrom && formattedTo) {
    return `?${formattedFrom}&${formattedTo}`
  }

  return `?${formattedFrom || formattedTo}`
}

// Setting `validities: any` to avoid having to create the types in `Search.svelte` by hand
export const findClosestValidity = (validities: any, date: string) => {
  // Return early if only 1 validity is present (this should always be the case, unless `PUBLIC_SEARCH_INFINITY: "true"`)
  if (validities.length === 1) {
    return validities[0]
  }

  let closestValidity = null
  let closestDistance = Infinity // Initialize to a very large number
  const filterDate = parseISO(date)

  for (const object of validities) {
    const fromDate = parseISO(object.validity.from)
    const toDate = object.validity.to ? parseISO(object.validity.to) : null

    // Check if the validity is active on input `date`
    if (fromDate <= filterDate && (!toDate || toDate >= filterDate)) {
      return object
    }

    // Calculate the distance input `date`
    const fromDistance = Math.abs(differenceInCalendarDays(fromDate, filterDate))
    const toDistance = toDate
      ? Math.abs(differenceInCalendarDays(toDate, filterDate))
      : Infinity
    const minDistance = Math.min(fromDistance, toDistance) // Find the minimum distance

    // Update the closest validity if this one is closer
    if (minDistance < closestDistance) {
      closestDistance = minDistance
      closestValidity = object
    }
  }

  return closestValidity
}
