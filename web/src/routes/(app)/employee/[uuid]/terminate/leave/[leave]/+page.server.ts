import type { LeaveTerminateInput } from "$lib/graphql/types"
import { exclusiveTo } from "$lib/utils/date"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<LeaveTerminateInput> => {
    const data = await request.formData()
    const endDate = exclusiveTo(data.get("to") as string | null)

    return {
      uuid: params.leave,
      to: endDate,
    }
  },
}
