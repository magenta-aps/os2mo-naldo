import type { EngagementUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EngagementUpdateInput[]> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit")
    const engagements = data.getAll("engagements") as string[]
    const startDate = data.get("from") as string

    const engagementInput = engagements.map((engagement) => {
      const endDate = data.get(`end-date-${engagement}`) as string | null
      return {
        uuid: engagement,
        ...(orgUnitUuid && { org_unit: orgUnitUuid }),
        validity: { from: startDate, ...(endDate && { to: endDate }) },
      }
    })

    return engagementInput
  },
}
