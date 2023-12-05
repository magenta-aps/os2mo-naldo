import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OwnerCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerCreateInput> => {
    const data = await request.formData()
    const ownerUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      person: params.uuid,
      owner: ownerUuid,
      // inference_priority
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
