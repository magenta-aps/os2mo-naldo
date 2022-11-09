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

interface Data {
  org_units: OrganisationUnitResponse[]
}

interface OrganisationUnitResponse {
  objects: OrganisationUnitElement[]
}

export interface OrganisationUnitElement {
  name: string
  uuid: null | string
  validity: Validity
  parent: ParentOrganisationUnit | null
}

interface ParentOrganisationUnit {
  uuid: null | string
}

interface Validity {
  from: string
  to: null | string
}

interface Error {
  message: string
}

export const load: PageLoad = async (event) => {
  let fromDate = ""
  date.subscribe((v) => (fromDate = v))

  const query = `
      query {
        org_units(uuids: "${event.params.uuid}" from_date: "${fromDate}") {
          objects {
            name
            uuid
            validity {
              from
              to
            }
            parent {
              uuid
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
