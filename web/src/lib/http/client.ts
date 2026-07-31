import { env } from "$lib/env"
import { keycloak } from "$lib/auth/keycloak"
import { GraphQLClient } from "graphql-request"
import { v4 as uuidv4 } from "uuid"

// Is exported as a function to delay evaluation of till the client is ready
export const graphQLClient = (signal?: AbortSignal) => {
  const timeout = AbortSignal.timeout(30000)
  const combinedSignal: AbortSignal = signal
    ? // @ts-expect-error AbortSignal.any() is supported in browsers but missing from TS lib types
      AbortSignal.any([signal, timeout])
    : timeout

  const requestId = uuidv4()

  const tagWithRequestId = (err: unknown) => {
    if (err instanceof Error) Object.assign(err, { requestId })
  }

  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v29`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
      // MO binds this to its logs
      "X-Request-ID": requestId,
    },
    signal: combinedSignal,
    responseMiddleware: tagWithRequestId,
    // Network failures never reach the responseMiddleware
    fetch: (input, init) =>
      fetch(input, init).catch((err) => {
        tagWithRequestId(err)
        throw err
      }),
  })
}
