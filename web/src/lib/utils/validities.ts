import type { OpenValidity, Validity } from "$lib/graphql/types"
import { firstValidDay, lastValidDay, startOfDay, toMO } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"

const { compare } = Temporal.ZonedDateTime

// The helpers below read nothing but `validity`, and return the element they
// were given, so the caller keeps its own generated type.
type HasValidity = { validity: Validity | OpenValidity }

// The earliest `from` and latest `to` of an object's validities, as the date
// inputs' `min` and `max`.
export type ValidityBounds = {
  from?: Temporal.ZonedDateTime | null
  to?: Temporal.ZonedDateTime | null
}

// A day, such as the global date, or a moment, such as a form's start date.
export type At = Temporal.PlainDate | Temporal.ZonedDateTime
const toMoment = (at: At) => (at instanceof Temporal.PlainDate ? startOfDay(at) : at)

export const getMinMaxValidities = (
  validities: HasValidity[] | undefined | null
): ValidityBounds => {
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

  let minFrom: Temporal.ZonedDateTime | undefined
  // null once any validity is open-ended
  let maxTo: Temporal.ZonedDateTime | null | undefined

  for (const { validity } of validities) {
    if (validity.from && (!minFrom || compare(validity.from, minFrom) < 0)) {
      minFrom = validity.from
    }

    if (!validity.to || maxTo === null) {
      maxTo = null
    } else if (maxTo === undefined || compare(validity.to, maxTo) > 0) {
      maxTo = validity.to
    }
  }
  return {
    from: minFrom,
    to: maxTo ?? undefined,
  }
}

export const formatQueryDates = (validity: Validity | OpenValidity): string => {
  const formattedFrom = validity.from
    ? `from=${encodeURIComponent(toMO(validity.from))}`
    : null
  const formattedTo = validity.to ? `to=${encodeURIComponent(toMO(validity.to))}` : null

  if (!formattedFrom && !formattedTo) {
    return ""
  }

  if (formattedFrom && formattedTo) {
    return `?${formattedFrom}&${formattedTo}`
  }

  return `?${formattedFrom || formattedTo}`
}

// Whether an edit moves an end date later: removes it, or sets it after the
// one the form loaded.
export const isLaterEnd = (
  to: Temporal.ZonedDateTime | null | undefined,
  original: Temporal.ZonedDateTime | null | undefined
): boolean => {
  return to ? !!original && compare(to, original) > 0 : !!original
}

// Clamp a date into a validity range, so a lookup on a referenced object
// (e.g. an engagement's org_unit) lands inside the referencing row's own
// validity and can't return a name the object only carried outside it. `validity.to` is exclusive (v29), so the upper clamp is the
// day before `to`.
export const clampDateToValidity = (
  date: Temporal.PlainDate,
  validity: Validity | OpenValidity
): Temporal.PlainDate => {
  const moment = startOfDay(date)

  if (validity.from && compare(moment, validity.from) < 0) {
    return firstValidDay(validity.from)!
  }
  if (validity.to && compare(moment, validity.to) >= 0) {
    return lastValidDay(validity.to)!
  }
  return date
}

// findClosestValidity, restricted to `range`: looks up at `date` clamped into
// the range, so the result is a validity that overlapped it.
export const findClosestValidityWithin = <T extends HasValidity>(
  validities: T[] | null | undefined,
  range: Validity | OpenValidity,
  date: Temporal.PlainDate
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
    if (range.to && validity.from && compare(validity.from, range.to) >= 0) return false
    if (validity.to && range.from && compare(validity.to, range.from) <= 0) return false
    return true
  })
}

// Setting `validities: any` to avoid having to create the types in `Search.svelte` by hand
export const findClosestValidity = (validities: any, date: At | null | undefined) => {
  // Return early if only 1 validity is present (this should always be the case, unless `PUBLIC_SEARCH_INFINITY: "true"`)
  if (validities.length === 1) {
    return validities[0]
  }

  // Preference order: the validity active on `date`; otherwise the latest past
  // one (the last name the object actually carried); a future one only when the
  // object doesn't exist yet at all on `date`.
  let latestPast = null
  let earliestFuture = null
  // A cleared date input gives no date, which matches no validity as active or
  // future, so the latest past one is picked.
  const moment = date ? toMoment(date) : null

  for (const object of validities) {
    const { from, to } = object.validity

    // Check if the validity is active on input `date`
    if (
      moment &&
      from &&
      compare(from, moment) <= 0 &&
      (!to || compare(to, moment) > 0)
    ) {
      return object
    }

    if (moment && from && compare(from, moment) > 0) {
      if (!earliestFuture || compare(from, earliestFuture.validity.from) < 0) {
        earliestFuture = object
      }
    } else {
      // Not active and not in the future, so `to` is set and in the past
      if (
        !latestPast ||
        (to && latestPast.validity.to && compare(to, latestPast.validity.to) > 0)
      ) {
        latestPast = object
      }
    }
  }

  return latestPast ?? earliestFuture
}
