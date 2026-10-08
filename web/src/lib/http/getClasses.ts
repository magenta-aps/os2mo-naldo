import { graphQLClient } from "$lib/http/client"
import type { At } from "$lib/utils/validities"
import { locale } from "svelte-i18n"
import { get } from "svelte/store"
import {
  ConfederationsDocument,
  FacetsAndClassesDocument,
  GetPrimaryClassesDocument,
  GetRoleClassesDocument,
} from "./query.generated"

export const getClasses = async (
  variables: {
    currentDate: At
    orgUuid: string | null
    facetUserKeys: string[]
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(FacetsAndClassesDocument, variables)
  return res.facets.objects
}

export const getPrimaryClasses = async (
  variables: {
    fromDate: At
    primaryClass: string
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(GetPrimaryClassesDocument, variables)
  return res.facets.objects
}

export const getRoleClasses = async (
  variables: {
    fromDate: At
    itSystem: string
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(GetRoleClassesDocument, variables)
  return res.facets.objects
}

// Confederations valid on `fromDate`, sorted for a Select. A trade union's
// parent must be one of these, so both the create and edit class forms use it.
export const getConfederations = async (fromDate: At, signal?: AbortSignal) => {
  const res = await graphQLClient(signal).request(ConfederationsDocument, { fromDate })
  return res.classes.objects
    .map((cls) => cls.current)
    .filter((current): current is NonNullable<typeof current> => current != null)
    .sort((a, b) =>
      a.name.localeCompare(b.name, get(locale) ?? "da", {
        sensitivity: "base", // Æ/æ = æ, case-insensitive
      })
    )
}
