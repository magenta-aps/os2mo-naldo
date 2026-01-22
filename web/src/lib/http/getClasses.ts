import { graphQLClient } from "$lib/http/client"
import { FacetsAndClassesDocument } from "./query.generated"
import { GetPrimaryClassesDocument } from "./query.generated"
import { GetRoleClassesDocument } from "./query.generated"

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

export const getPrimaryClasses = async (
  variables: {
    fromDate: string
    primaryClass: string
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(GetPrimaryClassesDocument, variables)
  return res.facets.objects
}

export const getRoleClasses = async (
  variables: {
    fromDate: string
    itSystem: string
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(GetRoleClassesDocument, variables)
  return res.facets.objects
}
