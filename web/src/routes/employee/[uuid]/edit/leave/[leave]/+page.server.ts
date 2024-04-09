import type { LeaveUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<LeaveUpdateInput> => {
    const data = await request.formData()
    const leaveTypeUuid = data.get("leave-type-uuid")
    const engagementUuid = data.get("engagement-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.leave,
      ...(leaveTypeUuid && { leave_type: leaveTypeUuid }),
      ...(engagementUuid && { engagement: engagementUuid }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
