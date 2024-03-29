import type { OpenValidity, Validity } from "$lib/graphql/types"
import { env } from "$env/dynamic/public"
import { date } from "$lib/stores/date"
import { get } from "svelte/store"
import { parseISO, isValid, min, max, format } from "date-fns"
import type { Facet } from "$lib/util/get_classes"
import { keycloak } from "$lib/util/keycloak"

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
  itsystem: { name: string }
}

export const getITUserITSystemName = (itusers: ITUserITSystemName[]) => {
  return itusers.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem.name}, ${ituser.user_key}`,
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
