import type { EngagementUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EngagementUpdateInput[]> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit")
    const engagements = data.getAll("engagements")
    const startDate = data.get("from")
    const endDates = data.getAll("end-dates")
    console.log(endDates)

    const engagementInput = engagements.map((engagement, i) => ({
      uuid: engagement,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      validity: {
        from: startDate,
        to: endDates[i],
      },
    }))
    console.log(engagementInput)

    return engagementInput
  },
}
