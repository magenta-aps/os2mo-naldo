import type { OrganisationUnitUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<OrganisationUnitUpdateInput> => {
    const data = await request.formData()
    const orgUnit = data.get("org-unit-uuid")
    const parent = data.get("select-parent-org-tree")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: orgUnit,
      parent: parent,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
