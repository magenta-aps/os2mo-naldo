import { graphQLClient } from "$lib/http/client"
import {
  GetOrgUnitValiditiesDocument,
  GetPersonValiditiesDocument,
  GetEngagementValiditiesDocument,
  GetFacetValiditiesDocument,
} from "./query.generated"
import { getMinMaxValidities } from "$lib/utils/validities"

export const getValidities = async (uuid: string) => {
  const res = await graphQLClient().request(GetOrgUnitValiditiesDocument, {
    uuid: uuid,
  })
  return getMinMaxValidities(res.org_units.objects[0].validities)
}
export const getPersonValidities = async (uuid: string) => {
  const res = await graphQLClient().request(GetPersonValiditiesDocument, {
    uuid: uuid,
  })
  return getMinMaxValidities(res.employees.objects[0].validities)
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
