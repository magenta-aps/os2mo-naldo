import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import { GraphQLClient } from "graphql-request"

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = (signal?: AbortSignal) => {
  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v23`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
    },
    signal,
  })
}
