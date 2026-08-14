import { resolveOrgUnitUuid } from "$lib/components/orgviewer/person/person"
import { OrgViewerPersonDetailDocument } from "$lib/components/orgviewer/person/queries"
import { env } from "$lib/env"
import { orgviewerServerGraphQLClient } from "$lib/server/orgviewerGraphQLClient"
import { error, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  const relationType = env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION
  const includeAssociations = relationType === "association" || relationType === "both"
  const includeEngagements = relationType === "engagement" || relationType === "both"

  const client = await orgviewerServerGraphQLClient()
  const res = await client.request(OrgViewerPersonDetailDocument, {
    uuid: [params.personUuid],
    includeAssociations,
    includeEngagements,
  })
  const person = res.employees.objects[0]?.validities[0]
  if (!person) {
    throw error(404, "Person not found")
  }

  // Ported from Person.vue's beforeRouteEnter/person-watcher: when the URL
  // doesn't already carry an org unit context, resolve one from the
  // person's own relations and redirect - e.g. a substitute link only ever
  // carries a personUuid, relying on this to land somewhere sensible.
  if (!params.uuid) {
    const orgUnitUuid = resolveOrgUnitUuid(person, relationType)
    if (orgUnitUuid) {
      const rootUuid = params.rootUuid ?? env.PUBLIC_ORGVIEWER_ROOT_UUID
      throw redirect(
        302,
        `/orgviewer/person/${params.personUuid}/${orgUnitUuid}/${rootUuid}`
      )
    }
  }

  return { person }
}
