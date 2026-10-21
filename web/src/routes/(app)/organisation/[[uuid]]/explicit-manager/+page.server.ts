import type { EngagementUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EngagementUpdateInput[]> => {
    const data = await request.formData()
    const engagements = data.getAll("engagements") as string[]
    // Empty unsets it, so the checked engagements fall back to MO's standard
    // manager. Unchecked engagements are not sent and keep theirs.
    const explicitManager = data.get("explicit-manager") || null
    const startDate = data.get("from") as string
    const endDates = data.getAll("end-dates") as string[]

    return engagements.map((engagement, i) => ({
      uuid: engagement,
      explicit_manager: explicitManager,
      validity: {
        from: startDate,
        ...(endDates[i] && { to: endDates[i] }),
      },
    }))
  },
}
