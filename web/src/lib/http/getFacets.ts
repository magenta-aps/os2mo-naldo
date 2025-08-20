import { get } from "svelte/store"
import { _, locale } from "svelte-i18n"
import { graphQLClient } from "$lib/http/client"
import { FacetDocument } from "./query.generated"
import { capital } from "$lib/utils/helpers"
import { findClosestValidity } from "$lib/utils/validities"

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
