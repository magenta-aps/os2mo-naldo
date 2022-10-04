import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import type { LoadEvent } from "@sveltejs/kit"

interface Query {
  data: Data | null
  errors?: Error[]
}

interface Data {
  facets: Facet[]
}

export interface Facet {
  uuid: null | string
  user_key: string
  classes: Class[]
}

interface Class {
  name: string
  uuid: null | string
}

interface Error {
  message: string
}

export const load = async (event: LoadEvent): Promise<Facet[] | undefined> => {
  const query = `
      query {
        facets(user_keys: ["org_unit_level", "org_unit_type"]) {
          uuid
          user_key
          classes {
            name
            uuid
          }
        }
      }`

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
  return json.data?.facets
}
