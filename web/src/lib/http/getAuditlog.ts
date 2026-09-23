import { env } from "$lib/env"
import { graphQLClient } from "$lib/http/client"
import { AuditlogDocument } from "./query.generated"

export const getAuditlog = async (uuid: string) => {
  const res = await graphQLClient().request(AuditlogDocument, {
    uuid: uuid,
    showCpr: env.PUBLIC_SHOW_CPR_NUMBER,
  })
  return res.registrations.objects
}
