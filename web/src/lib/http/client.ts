import { env } from "$lib/env"
import { get } from "svelte/store"
import { accessToken } from "$lib/stores/token"
import { GraphQLClient } from "graphql-request"

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = (signal?: AbortSignal) => {
  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v27`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + get(accessToken),
    },
    signal,
  })
}
