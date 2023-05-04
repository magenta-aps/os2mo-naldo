import { env } from "$env/dynamic/public"
import { keycloak } from "$lib/util/keycloak"
import { GraphQLClient } from "graphql-request"

export const fetchRest = async (path: string) => {
  const token = keycloak ? keycloak.token : "Keycloak disabled"
  return await fetch(`${env.PUBLIC_BASE_URL}/service/${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
}

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
  return await fetch(`${env.PUBLIC_BASE_URL}/${env.PUBLIC_GRAPHQL_VERSION}`, {
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

// HACK: Forced async/await becayse we have to wait initKeycloak() to finish
export const graphQLClient = new GraphQLClient(
  `${env.PUBLIC_BASE_URL}/${env.PUBLIC_GRAPHQL_VERSION}`,
  {
    headers: {
      "Content-Type": "application/json",
      // Authorization: "Bearer " + token,
    },
  }
)
