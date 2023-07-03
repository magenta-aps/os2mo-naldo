import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ManagerUpdateInput> => {
    const data = await request.formData()
    const employeeUuid = data.get("employee-uuid") ? data.get("employee-uuid") : null
    const managerLevel = data.get("manager-level")
    const managerType = data.get("manager-type")
    const responsibilities = data.get("responsibility")
    const startDate = data.get("from")
    const endDate = data.get("to")

    // how tf kan vi lave vakant på edits, når den er optional..

    return {
      uuid: params.manager,
      person: employeeUuid,
      ...(managerLevel && { manager_level: managerLevel }),
      ...(managerType && { manager_type: managerType }),
      ...(responsibilities && { responsibility: [responsibilities] }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
