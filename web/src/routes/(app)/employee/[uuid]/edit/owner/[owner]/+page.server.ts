import type { OwnerUpdateInput } from "$lib/graphql/types"
import { exclusiveTo } from "$lib/utils/date"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerUpdateInput> => {
    const data = await request.formData()
    const ownerUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = exclusiveTo(data.get("to") as string | null)

    return {
      uuid: params.owner,
      person: params.uuid,
      owner: ownerUuid,
      // TODO: inference_priority,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
