import { env } from "$env/dynamic/public"
import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import type { Facet } from "$lib/util/getClasses"
import { keycloak } from "$lib/util/keycloak"
import {
  format,
  isValid,
  parseISO,
  formatISO,
  addSeconds,
  differenceInCalendarDays,
} from "date-fns"
import { _, locale } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"
import { graphQLClient } from "$lib/util/http"
import { gql } from "graphql-request"
import {
  GetOrgUnitValiditiesDocument,
  GetEngagementValiditiesDocument,
  GetFacetValiditiesDocument,
  FacetsAndClassesDocument,
  FacetDocument,
} from "./query.generated"

gql`
  query GetOrgUnitValidities($uuid: [UUID!]) {
    org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query GetEngagementValidities($uuid: [UUID!]) {
    engagements(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query GetFacetValidities($uuid: [UUID!]) {
    facets(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query FacetsAndClasses(
    $currentDate: DateTime
    $orgUuid: [UUID!]
    $facetUserKeys: [String!]
  ) {
    facets(filter: { user_keys: $facetUserKeys }) {
      objects {
        validities {
          uuid
          user_key
          classes(
            filter: {
              from_date: $currentDate
              owner: { include_none: true, descendant: { uuids: $orgUuid } }
            }
          ) {
            name
            uuid
            user_key
          }
        }
      }
    }
  }
  query Facet($uuid: [UUID!], $fromDate: DateTime!) {
    facets(filter: { uuids: $uuid, from_date: $fromDate }) {
      objects {
        validities {
          uuid
          user_key
        }
      }
    }
  }
`
export const paginateQuery = async (
  query: string,
  variableValues: Record<string, any> = {},
  pageSize: number,
  onProgress: (count: number) => void = () => {},
  abortSignal?: AbortSignal,
  maxRetries: number = 30
): Promise<any[]> => {
  let nextCursor = null
  const results: any[] = []
  let requestCount = 0

  try {
    while (true) {
      if (abortSignal?.aborted) {
        break
      }

      requestCount++
      onProgress(requestCount)

      const variables = {
        ...variableValues,
        limit: pageSize,
        cursor: nextCursor,
      }

      for (let attempts = 0; attempts <= maxRetries; attempts++) {
        try {
          const result: any = await graphQLClient().request(query, variables)

          // Add results to the array
          for (const obj of result.page.objects) {
            results.push(obj)
          }
          nextCursor = result.page["page_info"]["next_cursor"]
          break
        } catch (error: any) {
          console.error("Error encountered during request:", error)
          const errorMessage = error?.response?.errors?.[0]?.message || error.message

          if (
            errorMessage &&
            errorMessage.toLowerCase().includes("signature has expired")
          ) {
            console.warn(
              `Retrying request (${
                attempts + 1
              }/${maxRetries}) due to signature expiration.`
            )
            // 1-second delay on retry
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            console.error("Failed after retries or non-retryable error:", error)
            throw error
          }
        }
      }

      if (!nextCursor) break // Exit if no more pages
    }
  } catch (error) {
    console.error("Error during pagination:", error)
    throw error
  }

  return results
}

export const getValidities = async (uuid: string) => {
  const res = await graphQLClient().request(GetOrgUnitValiditiesDocument, {
    uuid: uuid,
  })
  return getMinMaxValidities(res.org_units.objects[0].validities)
}
export const getEngagementValidities = async (uuid: string) => {
  const res = await graphQLClient().request(GetEngagementValiditiesDocument, {
    uuid: uuid,
  })
  return getMinMaxValidities(res.engagements.objects[0].validities)
}
export const getFacetValidities = async (uuid: string, signal?: AbortSignal) => {
  const res = await graphQLClient(signal).request(GetFacetValiditiesDocument, {
    uuid: uuid,
  })
  return getMinMaxValidities(res.facets.objects[0].validities)
}
export const getClasses = async (
  variables: {
    currentDate: string
    orgUuid: string | null
    facetUserKeys: string[]
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(FacetsAndClassesDocument, variables)
  return res.facets.objects
}

export const getFacets = async (
  variables: {
    uuid: string | null
    fromDate: string
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(FacetDocument, variables)
  const items = res.facets.objects.map((facet) => {
    // Doing both the translation and sort in here, means that changing language won't affect the list, until it's rerun
    const closest = findClosestValidity(facet.validities, variables.fromDate)
    return {
      uuid: closest.uuid,
      name: capital(
        get(_)("facets.name." + closest.user_key, {
          default: closest.user_key,
        })
      ),
      user_key: closest.user_key,
    }
  })
  return items.sort((a, b) =>
    a.name.localeCompare(b.name, get(locale) ?? "da", {
      sensitivity: "base", // Æ/æ = æ, case-insensitive
    })
  )
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
      return globalDate < obj.validity.from?.split("T")[0]
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

export const getITUserITSystemName = (itusers: ITUserITSystemName[] | undefined) => {
  return itusers?.map((ituser) => ({
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

export type KleNumberTitleAndUuid = {
  uuid: string
  name: string
  user_key: string
}

export const getKleNumberTitleAndUuid = (kles: KleNumberTitleAndUuid[]) => {
  const KleNumbers = kles.map((kle) => ({
    uuid: kle.uuid,
    name: `${kle.user_key} - ${kle.name}`,
  }))
  return KleNumbers.sort((a, b) => (a.name > b.name ? 1 : -1))
}

type ITSystem = {
  current?: {
    uuid: string
    name: string
  } | null
}

export const getITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems
    .filter((itsystem) => itsystem.current && itsystem.current !== null)
    .map((itsystem) => ({
      uuid: itsystem.current!.uuid,
      name: itsystem.current!.name,
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
    if (!lastCalledAt || now - lastCalledAt >= 1000) {
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

type Item = any

// `get(_)` for translations since `$_` is a store and doesn't work in .ts files
export const sortItemsBy = (items: Item[], sortBy: string) => {
  return items
    .map((item) => ({
      ...item,
      [sortBy]: capital(get(_)(item[sortBy], { values: { n: item.n } })),
    }))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))
}

// Insights
export type Field = {
  value: string
  subString: string
}

export type MainQuery = {
  operation: string
  filter: string
  value: string
  n: number
  fields: Field[]
}

export type SelectedQuery = {
  mainQuery?: MainQuery
  chosenFields: Field[]
}

export const resolveFieldValue = (searchObject: any, header: Field) => {
  if (!searchObject) {
    return
  }
  if (header.subString === "name") {
    return searchObject.name ?? ""
  } else if (header.value === "breadcrumbs") {
    return searchObject.ancestors.reverse()
  } else if (header.value === "cpr_number") {
    return searchObject.person[0].cpr_number
  } else if (
    header.value === "name" &&
    header.subString !== "name" &&
    searchObject.person
  ) {
    return searchObject.person[0]?.name ?? ""
  } else if (header.value === "email" || header.value === "phone") {
    if (searchObject.person && searchObject.person[0][header.value]) {
      return (
        searchObject.person[0][header.value]
          .map((address: { name: string }) => address.name)
          .join(", ") ?? ""
      )
    } else {
      return ""
    }
  } else if (
    header.value === "name" &&
    header.subString !== "name" &&
    searchObject.owner
  ) {
    return searchObject.owner[0]?.name ?? ""
  } else if (
    header.value === "manager" &&
    header.subString !== "name" &&
    searchObject.managers
  ) {
    return searchObject.managers
      .map(
        (manager: { person: { name: string }[] }) =>
          manager.person?.[0].name ?? capital(get(_)("vacant"))
      )
      .join(", ")
  } else if (header.value === "subject") {
    return searchObject.__typename
  } else if (header.value === "validity") {
    return [searchObject.validity?.from ?? "", searchObject.validity?.to ?? ""]
  } else if (header.value === "substitute" && searchObject.substitute) {
    return searchObject.substitute[0]?.name ?? ""
  } else if (header.value === "account_name" && searchObject.user_key) {
    return searchObject.user_key ?? ""
  } else if (header.value === "ituser" && searchObject.ituser) {
    return searchObject.ituser[0].user_key ?? ""
  } else if (header.value === "role" && searchObject.role) {
    return searchObject.role[0].name ?? ""
  } else if (header.value === "user_key") {
    return searchObject.user_key ?? ""
  } else if (
    env.PUBLIC_SHOW_EXTENSION_1 === "true" &&
    header.value === "job_function" &&
    header.subString === "extension_1"
  ) {
    return searchObject.extension_1 ?? ""
  } else if (
    env.PUBLIC_SHOW_EXTENSION_1 === "true" &&
    header.value === "job_code" &&
    searchObject.job_function
  ) {
    return searchObject.job_function?.name ?? ""
  } else if (header.value === "related_unit") {
    return [
      searchObject.org_units[0]?.name ?? "",
      searchObject.org_units[1]?.name ?? "",
    ]
  } else if (header.value === "manager_responsibility") {
    return searchObject.responsibilities
      .map((responsibility: { name: string }) => responsibility.name)
      .join(", ")
  } else if (header.value === "manager_email") {
    return searchObject.managers
      .flatMap((manager: { person: { addresses: { name: string }[] }[] }) =>
        manager.person?.[0].addresses.map((address) => address.name ?? "")
      )
      .join(", ")
  } else {
    return searchObject[header.value]?.name ?? ""
  }
}

export const isUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export const checkSDIdentifier = (name: string, user_key: string) => {
  if (
    env.PUBLIC_SHOW_SD_CODE_IN_TREES !== "true" ||
    name === user_key ||
    user_key === "-" ||
    isUUID(user_key)
  ) {
    return name
  }
  return `${name} (${user_key})`
}
