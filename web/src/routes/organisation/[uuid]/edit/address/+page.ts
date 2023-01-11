import { env } from "$env/dynamic/public"
import { date } from "$lib/stores/date"
import { keycloak } from "$lib/util/keycloak"
import type { PageLoad } from "./$types"

// TODO: Should not be disabled when possible
// Reason: https://stackoverflow.com/questions/71120958/fetch-error-when-refreshing-page-with-await-block-in-sveltekit
// Fixes being unable to refresh or open this route from a link
export const ssr = false

interface Query {
  data: Data | null
  errors?: Error[]
}

export interface Data {
  facets: Facet[]
  org_units: OrganisationUnitResponse[]
}

interface Facet {
  uuid: null | string
  user_key: string
  classes: Class[]
}

interface Class {
  name: string
  uuid: null | string
}

interface OrganisationUnitResponse {
  objects: OrganisationUnit[]
}

interface OrganisationUnit {
  uuid: null | string
  name: string
  parent: Class | null
}

interface Error {
  message: string
}

export const load: PageLoad = async (event) => {
  const query = `
      query {
        addresses(uuids: ["0011406b-419f-4236-91e3-8040e9438370"]) {
          objects {
            name
            type
            org_unit {
              name
            }
          }
        }
      }
      `

  const token = keycloak ? keycloak.token : "Keycloak disabled"
  const res = await event.fetch(`${env.PUBLIC_BASE_URL}/graphql/v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      query: query,
    }),
  })
  const json: Query = await res.json()
  if (json.data) {
    return json.data
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
