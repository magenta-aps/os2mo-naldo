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
  org_units: OrganisationUnitResponse[]
}

interface Class {
  name: string
  uuid: null | string
}

interface OrganisationUnitResponse {
  objects: Class[]
}

interface Error {
  message: string
}

export const load: PageLoad = async (event) => {
  let fromDate = ""
  date.subscribe((v) => (fromDate = v))

  const query = `
      query {
        org_units(filter: { uuids: "${event.params.uuid}" from_date: "${fromDate}" }) {
          objects {
            objects {
              uuid
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
