import type { OwnerCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerCreateInput> => {
    // FIXME: When mutator is coded, do this.
    const data = await request.formData()
    const ownerUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      owner: ownerUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
