import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OrganisationUnitCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<OrganisationUnitCreateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const parent = data.get("parent-uuid")
    const orgUnitLevel = data.get("org-unit-level")
    const orgUnitNumber = data.get("org-unit-number") as string
    const orgType = data.get("org-unit-type")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      name: name,
      ...(parent && { parent: parent }),
      org_unit_type: orgType,
      ...(orgUnitLevel && { org_unit_level: orgUnitLevel }),
      ...(orgUnitNumber && { user_key: orgUnitNumber }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
