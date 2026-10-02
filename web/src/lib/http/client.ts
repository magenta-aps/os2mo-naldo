import { keycloak } from "$lib/auth/keycloak"
import { env } from "$lib/env"
import { convertDateTimes, jsonSerializer } from "$lib/http/dateTimes"
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

  const client = new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v29`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak?.token,
      // MO binds this to its logs
      "X-Request-ID": requestId,
    },
    signal: combinedSignal,
    jsonSerializer,
    responseMiddleware: tagWithRequestId,
    // Network failures never reach the responseMiddleware
    fetch: (input, init) =>
      fetch(input, init).catch((err) => {
        tagWithRequestId(err)
        throw err
      }),
  })

  // Every MO response passes here, so its DateTime values are converted
  // exactly once.
  const request = client.request.bind(client)
  client.request = (async (...args: Parameters<typeof request>) =>
    convertDateTimes(await request(...args))) as typeof client.request
  return client
}
