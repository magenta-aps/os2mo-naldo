import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { LeaveCreateInput, LeaveUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<LeaveUpdateInput> => {
    const data = await request.formData()
    const leaveTypeUuid = data.get("leave-type-uuid")
    const personUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.leave,
      person: personUuid,
      leave_type: leaveTypeUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
