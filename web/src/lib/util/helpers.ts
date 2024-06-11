import { env } from "$env/dynamic/public"
import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import type { Facet } from "$lib/util/get_classes"
import { keycloak } from "$lib/util/keycloak"
import {
  format,
  isValid,
  parseISO,
  formatISO,
  addSeconds,
  differenceInCalendarDays,
} from "date-fns"
import { get } from "svelte/store"

export const getUuidFromHash = (hash: string) => {
  let uuidFromHash = hash.split("&").find((e) => e.startsWith("#uuid="))

  return uuidFromHash ? uuidFromHash.replace("#uuid=", "") : undefined
}

export const tenseToValidity = (
  tense: Tense,
  date: string
): { fromDate: string | null; toDate: string | null } | {} => {
  switch (tense) {
    case "past":
      return { fromDate: null, toDate: date }
    case "present":
      return { fromDate: date }
    case "future":
      return { fromDate: date, toDate: null }
  }
}

export const filterTenseToValidity = (
  tense: Tense,
  date: string
): { from_date: string | null; to_date: string | null } | {} => {
  switch (tense) {
    case "past":
      return { from_date: null, to_date: date }
    case "present":
      return { from_date: date }
    case "future":
      return { from_date: date, to_date: null }
  }
}

export const tenseFilter = (
  obj: { validity: Validity | OpenValidity },
  tense: Tense
) => {
  const globalDate = get(date)
  switch (tense) {
    case "past":
      return globalDate > obj.validity.to?.split("T")[0]
    case "present":
      return true
    case "future":
      return globalDate < obj.validity.from.split("T")[0]
  }
}

type ITUserITSystemName = {
  uuid: string
  user_key: string
  itsystem: {
    name: string
    uuid?: string
  }
}

export const getITUserITSystemName = (itusers: ITUserITSystemName[]) => {
  return itusers.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem.name}, ${ituser.user_key}`,
    itsystem: { uuid: ituser.itsystem.uuid },
  }))
}

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
export type EngagementTitleAndUuid = {
  uuid: string
  job_function: { name: string }
  org_unit: { name: string }[]
}

export const getEngagementTitlesAndUuid = (engagements: EngagementTitleAndUuid[]) => {
  return engagements.map((engagement) => ({
    uuid: engagement.uuid,
    name: `${engagement.job_function.name}, ${engagement.org_unit[0].name}`,
  }))
}

type ITSystem = {
  objects: {
    uuid: string
    name: string
  }[]
}

export const getITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems.map((itsystem) => ({
    uuid: itsystem.objects[0].uuid,
    name: itsystem.objects[0].name,
  }))
  return ITSystems.sort((a, b) => (a.name > b.name ? 1 : -1))
}

// Type used for Multi-select
export type UnpackedClass = {
  name: string
  uuid: string
  user_key: string
}[]

export const getFacetUserKeys = (facets: Facet[]) => {
  return facets.map((facet) => ({
    uuid: facet.objects[0].uuid,
    name: facet.objects[0].user_key,
  }))
}

let lastCalledAt: number | null = null

export const debounce = async (
  func: (...args: any[]) => Promise<any>,
  ...args: any[]
): Promise<void> => {
  const now = Date.now()

  return new Promise<void>((resolve) => {
    if (!lastCalledAt || now - lastCalledAt >= 500) {
      lastCalledAt = now
      resolve(func(...args))
    }
  })
}

export const cprLookup = async (cpr: string) => {
  const res = await fetch(`${env.PUBLIC_BASE_URL}/service/e/cpr_lookup/?q=${cpr}`, {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
  // FIXME: Maybe return empty array, if call fails?
  return [await res.json()]
}

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
