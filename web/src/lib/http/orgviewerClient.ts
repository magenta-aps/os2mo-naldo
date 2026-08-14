import { orgviewerToken } from "$lib/auth/orgviewerAuth"
import { env } from "$lib/env"
import { GraphQLClient } from "graphql-request"
import { v4 as uuidv4 } from "uuid"

// Mirrors $lib/http/client.ts's graphQLClient, but authenticates with the
// server-minted client-credentials token instead of an interactive Keycloak
// session - orgviewer has no logged-in user.
export const orgviewerGraphQLClient = (signal?: AbortSignal) => {
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
      Authorization: "Bearer " + orgviewerToken,
      "X-Request-ID": requestId,
    },
    signal: combinedSignal,
    responseMiddleware: tagWithRequestId,
    fetch: (input, init) =>
      fetch(input, init).catch((err) => {
        tagWithRequestId(err)
        throw err
      }),
  })
}
