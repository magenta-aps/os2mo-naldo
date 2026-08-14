import { env } from "$lib/env"
import { getServiceToken } from "$lib/server/orgviewerAuth"
import { GraphQLClient } from "graphql-request"

// Server-side counterpart to $lib/http/orgviewerClient.ts's
// orgviewerGraphQLClient - used from +page.server.ts load functions that
// need the org unit context resolved (and possibly redirect) before the
// page renders, so there's no client-fetched token to read yet.
export const orgviewerServerGraphQLClient = async () => {
  const { access_token } = await getServiceToken()

  return new GraphQLClient(`${env.PUBLIC_BASE_URL}/graphql/v29`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
}
