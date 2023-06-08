import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ManagerCreateInput> => {
    const data = await request.formData()
    const employeeUuid = data.get("employee-uuid")
    const managerType = data.get("manager-type")
    const managerLevel = data.get("manager-level")
    // Needs support for adding more than 1 responsibility
    const responsibility = data.get("responsibility")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: [responsibility],
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(employeeUuid && { person: employeeUuid }),
    }
  },
}
