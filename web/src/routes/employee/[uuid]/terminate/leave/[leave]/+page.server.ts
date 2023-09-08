import type { LeaveTerminateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<LeaveTerminateInput> => {
    const data = await request.formData()
    const endDate = data.get("to")

    return {
      uuid: params.leave,
      to: endDate,
    }
  },
}
