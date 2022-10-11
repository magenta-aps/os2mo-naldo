import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import type { LoadEvent } from "@sveltejs/kit"

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

export const load = async (event: LoadEvent): Promise<Data> => {
  const query = `
      query {
        org_units(uuids: "${event.params.uuid}") {
          objects {
            uuid
            name
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
