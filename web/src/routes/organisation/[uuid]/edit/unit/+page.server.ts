import type { OrganisationUnitUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<OrganisationUnitUpdateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const parent = data.get("org-unit-uuid")
    const orgLevel = data.get("org-level")
    const timePlanning = data.get("time-planning")
    const orgType = data.get("org-type")
    const orgUnitNumber = data.get("org-unit-number") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.uuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      name: name,
      parent: parent,
      org_unit_level: orgLevel,
      time_planning: timePlanning,
      org_unit_type: orgType,
      user_key: orgUnitNumber,
    }
  },
}
