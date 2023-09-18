import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OrganisationUnitUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<OrganisationUnitUpdateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const parent = data.get("select-org-tree")
    const orgLevel = data.get("org-level")
    const orgType = data.get("org-type")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.uuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(name && { name: name }),
      ...(parent && { parent: parent }),
      ...(orgLevel && { org_unit_level: orgLevel }),
      ...(orgType && { org_unit_type: orgType }),
      // Optional fields in GraphQL currently not used by old frontend
      // TODO: Ask someone if they should active input fields
      // ...(userKey && {user_key: userKey}),
      // ...(timePlanning && { time_plannning: timePlanning }),
      // ...(orgHierarchy && { org_unit_hierarchy: orgHierarchy}),
    }
  },
}
