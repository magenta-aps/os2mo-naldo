import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EngagementUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EngagementUpdateInput> => {
    const data = await request.formData()
    const engagementUuid = data.get("engagement-uuid")
    const orgUnitUuid = data.get("org-unit-uuid")
    const startDate = data.get("from")

    return {
      uuid: engagementUuid,
      org_unit: orgUnitUuid,
      validity: { from: startDate },
    }
  },
}
