import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import type { PageLoad } from "./$types"

// TODO: Should not be disabled when possible
// Reason: https://stackoverflow.com/questions/71120958/fetch-error-when-refreshing-page-with-await-block-in-sveltekit
// Fixes being unable to refresh or open this route from a link
export const ssr = false

export interface Query {
  data: Data | null
  errors?: Error[]
}

export interface Data {
  itusers: ITUserResponse[]
  itsystems: ITSystem[]
}

export interface ITSystem {
  name: string
  uuid: null | string
}

export interface ITUserResponse {
  uuid: string
  objects: ITUser[]
}

export interface ITUser {
  uuid: null | string
  itsystem: ITSystem
  validity: Validity
  user_key: null | string
  primary_uuid: string
}

export interface Validity {
  from: string
  to: null | string
}

export interface Error {
  message: string
}

export const load: PageLoad = async (event) => {
  const query = `
    query {
      itusers(uuids: "${event.params.ituser}") {
        uuid
        objects {
          uuid
          primary_uuid
          itsystem {
            name
            uuid
          }
          validity {
            from
            to
          }
          user_key
        }  
      }
      itsystems {
        name
        uuid
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
