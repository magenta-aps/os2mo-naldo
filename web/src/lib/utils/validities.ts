import type { OpenValidity, Validity } from "$lib/graphql/types"
import { format, formatISO, isValid, parseISO, subDays } from "date-fns"

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
  const to = parseISO(validity.to)

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

// Clamp a date into a validity range, so a lookup on a referenced object
// (e.g. an engagement's org_unit) lands inside the referencing row's own
// validity and can't return a name the object only carried outside it. `validity.to` is exclusive (v29), so the upper clamp is the
// day before `to`. Compares date portions like `tenseFilter` does.
export const clampDateToValidity = (
  date: string,
  validity: Validity | OpenValidity
): string => {
  const fromDay = validity.from?.split("T")[0]
  const toDay = validity.to?.split("T")[0]

  if (fromDay && date < fromDay) {
    return fromDay
  }
  if (toDay && date >= toDay) {
    return format(subDays(parseISO(toDay), 1), "yyyy-MM-dd")
  }
  return date
}

// findClosestValidity, restricted to `range`: looks up at `date` clamped into
// the range, so the result is a validity that overlapped it.
export const findClosestValidityWithin = (
  validities: any,
  range: Validity | OpenValidity,
  date: string
) => {
  if (!validities || !validities.length) {
    return null
  }
  return findClosestValidity(validities, clampDateToValidity(date, range))
}

// All validities overlapping `range`, e.g. every name a referenced org_unit
// has had within the referencing row's own validity. `to` is exclusive (v29),
// so validities merely touching at an endpoint do not overlap.
export const filterValiditiesInRange = (
  validities: any[],
  range: Validity | OpenValidity
) => {
  const rangeFrom = range.from ? parseISO(range.from) : null
  const rangeTo = range.to ? parseISO(range.to) : null

  return validities.filter((object) => {
    const from = parseISO(object.validity.from)
    const to = object.validity.to ? parseISO(object.validity.to) : null

    if (rangeTo && isValid(rangeTo) && isValid(from) && from >= rangeTo) return false
    if (to && isValid(to) && rangeFrom && isValid(rangeFrom) && to <= rangeFrom)
      return false
    return true
  })
}

// Setting `validities: any` to avoid having to create the types in `Search.svelte` by hand
export const findClosestValidity = (validities: any, date: string) => {
  // Return early if only 1 validity is present (this should always be the case, unless `PUBLIC_SEARCH_INFINITY: "true"`)
  if (validities.length === 1) {
    return validities[0]
  }

  // Preference order: the validity active on `date`; otherwise the latest past
  // one (the last name the object actually carried); a future one only when the
  // object doesn't exist yet at all on `date`.
  let latestPast = null
  let earliestFuture = null
  const filterDate = parseISO(date)

  for (const object of validities) {
    const fromDate = parseISO(object.validity.from)
    const toDate = object.validity.to ? parseISO(object.validity.to) : null

    // Check if the validity is active on input `date`
    if (fromDate <= filterDate && (!toDate || toDate > filterDate)) {
      return object
    }

    if (fromDate > filterDate) {
      if (!earliestFuture || fromDate < parseISO(earliestFuture.validity.from)) {
        earliestFuture = object
      }
    } else {
      // Not active and not in the future, so `toDate` is set and in the past
      if (!latestPast || toDate! > parseISO(latestPast.validity.to)) {
        latestPast = object
      }
    }
  }

  return latestPast ?? earliestFuture
}
