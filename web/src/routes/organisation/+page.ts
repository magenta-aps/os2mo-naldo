import { graphQLClient } from "$lib/util/http"
import type { PageLoad } from "./$types"
import { date } from "$lib/stores/date"
import { OrgUnitsDocument } from "$lib/graphql/types"
import { isAuth } from "$lib/stores/auth"
import { GraphQLClient } from "graphql-request"
import { keycloak } from "$lib/util/keycloak"
import { env } from "$env/dynamic/public"

export const ssr = false

export const load: PageLoad = async () => {
  let fromDate = ""
  date.subscribe((v) => (fromDate = v))

  const token = keycloak ? keycloak.token : "Keycloak disabled"
  console.log(token)
  const res = await new GraphQLClient(
    `${env.PUBLIC_BASE_URL}/${env.PUBLIC_GRAPHQL_VERSION}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  ).request(OrgUnitsDocument, { fromDate: fromDate })
  console.log(res)
  return res
}
