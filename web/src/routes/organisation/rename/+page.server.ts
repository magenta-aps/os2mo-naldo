import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OrganisationUnitUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<OrganisationUnitUpdateInput> => {
    const data = await request.formData()
    const orgUnit = data.get("org-unit-uuid")
    const name = data.get("name") as string
    const startDate = data.get("from")

    return {
      uuid: orgUnit,
      name: name,
      validity: { from: startDate },
    }
  },
}
