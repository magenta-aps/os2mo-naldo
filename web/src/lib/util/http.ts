import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import { GraphQLClient } from "graphql-request"

export const postRest = async (path: string, payload: any) => {
  const token = keycloak ? keycloak.token : "Keycloak disabled"
  return await fetch(`${env.PUBLIC_BASE_URL}/service/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(payload),
  })
}

export const fetchGraph = async (query: string | object | any): Promise<Response> => {
  const token = keycloak ? keycloak.token : "Keycloak disabled"
  return await fetch(`${env.PUBLIC_BASE_URL}/graphql/v21`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(
      typeof query === "string"
        ? { query: query }
        : typeof query === "object"
        ? query
        : TypeError("Bad query")
    ),
  })
}

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = () => {
  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v21`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
    },
  })
}
