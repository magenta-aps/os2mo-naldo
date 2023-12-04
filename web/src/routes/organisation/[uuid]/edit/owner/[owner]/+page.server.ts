import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OwnerUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerUpdateInput> => {
    const data = await request.formData()
    const ownerUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.owner,
      org_unit: params.uuid,
      owner: ownerUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
