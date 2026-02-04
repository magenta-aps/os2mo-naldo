import { graphQLClient } from "$lib/http/client"
import { AuditlogDocument } from "./query.generated"

export const getAuditlog = async (uuid: string) => {
  const res = await graphQLClient().request(AuditlogDocument, {
    uuid: uuid,
  })
  return res.registrations.objects
}
