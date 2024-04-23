import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import { GraphQLClient } from "graphql-request"

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = () => {
  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v21`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
    },
  })
}
