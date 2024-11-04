import type { EngagementUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EngagementUpdateInput[]> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit")
    const engagements = data.getAll("engagements")
    const startDate = data.get("from")
    const endDate = data.get("to")

    const engagementInput = engagements.map((engagement) => ({
      uuid: engagement,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      validity: {
        from: startDate,
        ...(endDate && { to: endDate }),
      },
    }))

    return engagementInput
  },
}
