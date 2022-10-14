import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import type { LoadEvent } from "@sveltejs/kit"

// TODO: Should not be disabled when possible
// Reason: https://stackoverflow.com/questions/71120958/fetch-error-when-refreshing-page-with-await-block-in-sveltekit
// Fixes being unable to refresh or open this route from a link
export const ssr = false

interface Query {
  data: Data | null
  errors?: Error[]
}

interface Data {
  org_units: OrganisationUnitResponse[]
}

interface OrganisationUnitResponse {
  objects: OrganisationUnit[]
}

export interface OrganisationUnit {
  name: string
  uuid: null | string
  validity: Validity
}

interface Validity {
  from: string
  to: null | string
}

interface Error {
  message: string
}

export const load = async (event: LoadEvent): Promise<OrganisationUnit> => {
  const query = `
      query {
        org_units(uuids: "${event.params.uuid}") {
          objects {
            name
            uuid
            validity {
              from
              to
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
    return json.data.org_units[0].objects[0]
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
