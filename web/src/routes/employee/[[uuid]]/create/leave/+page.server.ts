import type { LeaveCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<LeaveCreateInput> => {
    const data = await request.formData()

    const employeeUuid = data.get("employee-uuid")
    const engagementUuid = data.get("engagement-uuid")
    const leaveTypeUuid = data.get("leave-type-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      person: employeeUuid,
      engagement: engagementUuid,
      leave_type: leaveTypeUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
