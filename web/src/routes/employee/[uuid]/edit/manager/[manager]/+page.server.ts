import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ManagerUpdateInput> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit-uuid")
    const managerType = data.get("manager-type")
    const managerLevel = data.get("manager-level")
    // Needs support for adding more than 1 responsibility
    const responsibility = data.get("responsibility")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.manager,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      ...(managerType && { manager_type: managerType }),
      ...(managerLevel && { manager_level: managerLevel }),
      ...([responsibility] && { responsibility: [responsibility] }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
