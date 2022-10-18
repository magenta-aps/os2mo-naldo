import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, url, params }: RequestEvent): Promise<any> => {
    const data = await request.formData()
    const name = data.get("name")
    const parent = data.get("select-org-tree")
    const orgLevel = data.get("org-level")
    const orgType = data.get("org-type")
    const startDate = data.get("start-date")
    const endDate = data.get("end-date")

    const query = `
      mutation FrontendOrgUnitEdit ($input: OrganisationUnitUpdateInput!) {
        org_unit_update(input: $input) {
          uuid
        }
      }
    `
    return {
      query,
      variables: {
        input: {
          uuid: params.uuid,
          validity: { from: startDate, ...(endDate && { to: endDate }) },
          ...(name && { name: name }),
          ...(parent && { parent: parent }),
          ...(orgLevel && { org_unit_level: orgLevel }),
          ...(orgType && { org_unit_type: orgType }),
          // ...(userKey && {user_key: userKey}),
          // ...(timePlanning && { time_plannning: timePlanning }),
          // ...(orgHierarchy && { org_unit_hierarchy: orgHierarchy}),
        },
      },
    }
  },
}
