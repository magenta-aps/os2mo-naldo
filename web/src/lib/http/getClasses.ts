import { graphQLClient } from "$lib/http/client"
import type { At } from "$lib/utils/validities"
import {
  FacetsAndClassesDocument,
  GetPrimaryClassesDocument,
  GetRoleClassesDocument,
  TradeUnionsDocument,
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

export type TradeUnionGroup = {
  name: string
  children: { uuid: string; name: string }[]
}

// Trade unions valid on `fromDate`, grouped by their confederation.
export const getTradeUnions = async (
  fromDate: At,
  signal?: AbortSignal
): Promise<TradeUnionGroup[]> => {
  const res = await graphQLClient(signal).request(TradeUnionsDocument, { fromDate })
  return res.classes.objects.flatMap(({ current }) =>
    current
      ? [
          {
            name: current.name,
            children: current.children_response.objects.flatMap((child) =>
              child.current ? [child.current] : []
            ),
          },
        ]
      : []
  )
}
