import { env } from "$lib/env"
import { keycloak } from "$lib/auth/keycloak"
import { GraphQLClient } from "graphql-request"

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = (signal?: AbortSignal) => {
  const timeout = AbortSignal.timeout(30000)
  const combinedSignal: AbortSignal = signal
    ? // @ts-expect-error AbortSignal.any() is supported in browsers but missing from TS lib types
      AbortSignal.any([signal, timeout])
    : timeout

  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v29`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
    },
    signal: combinedSignal,
  })
}
