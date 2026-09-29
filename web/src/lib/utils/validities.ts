import type { OpenValidity, Validity } from "$lib/graphql/types"
import { dayBefore } from "$lib/utils/date"

// The helpers below read nothing but `validity`, and return the element they
// were given, so the caller keeps its own generated type. Validity bounds are
// yyyy-MM-dd days, which compare correctly as strings.
type HasValidity = { validity: Validity | OpenValidity }

export const getMinMaxValidities = (validities: HasValidity[] | undefined | null) => {
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

  let minFrom: string | undefined
  // null once any validity is open-ended
  let maxTo: string | null | undefined

  for (const { validity } of validities) {
    if (validity.from && (!minFrom || validity.from < minFrom)) {
      minFrom = validity.from
    }

    if (!validity.to || maxTo === null) {
      maxTo = null
    } else if (maxTo === undefined || validity.to > maxTo) {
      maxTo = validity.to
    }
  }
  return {
    from: minFrom,
    to: maxTo ? dayBefore(maxTo) : undefined,
  }
}

export const formatQueryDates = (validity: Validity | OpenValidity): string => {
  const formattedFrom = validity.from ? `from=${validity.from}` : null
  const formattedTo = validity.to ? `to=${validity.to}` : null

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
// day before `to`.
export const clampDateToValidity = (
  date: string,
  validity: Validity | OpenValidity
): string => {
  if (validity.from && date < validity.from) {
    return validity.from
  }
  if (validity.to && date >= validity.to) {
    return dayBefore(validity.to)!
  }
  return date
}

// findClosestValidity, restricted to `range`: looks up at `date` clamped into
// the range, so the result is a validity that overlapped it.
export const findClosestValidityWithin = <T extends HasValidity>(
  validities: T[] | null | undefined,
  range: Validity | OpenValidity,
  date: string
): T | null => {
  if (!validities || !validities.length) {
    return null
  }
  return findClosestValidity(validities, clampDateToValidity(date, range))
}

// All validities overlapping `range`, e.g. every name a referenced org_unit
// has had within the referencing row's own validity. `to` is exclusive (v29),
// so validities merely touching at an endpoint do not overlap.
export const filterValiditiesInRange = <T extends HasValidity>(
  validities: T[],
  range: Validity | OpenValidity
): T[] => {
  return validities.filter(({ validity }) => {
    if (range.to && validity.from && validity.from >= range.to) return false
    if (validity.to && range.from && validity.to <= range.from) return false
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
  for (const object of validities) {
    const { from, to } = object.validity

    // Check if the validity is active on input `date`
    if (from <= date && (!to || to > date)) {
      return object
    }

    if (from > date) {
      if (!earliestFuture || from < earliestFuture.validity.from) {
        earliestFuture = object
      }
    } else {
      // Not active and not in the future, so `to` is set and in the past
      if (!latestPast || to > latestPast.validity.to) {
        latestPast = object
      }
    }
  }

  return latestPast ?? earliestFuture
}
