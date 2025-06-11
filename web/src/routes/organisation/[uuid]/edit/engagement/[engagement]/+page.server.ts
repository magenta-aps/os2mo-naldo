import type { EngagementUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<EngagementUpdateInput> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit-uuid")
    const userKey = data.get("user-key") as string
    const engagementType = data.get("engagement-type")
    const jobFunction = data.get("job-function")
    const extension_1 = data.get("extension-1") as string
    const extension_2 = data.get("extension-2") as string
    const primary = data.get("primary")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.engagement,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      user_key: userKey,
      ...(engagementType && { engagement_type: engagementType }),
      ...(jobFunction && { job_function: jobFunction }),
      extension_1: extension_1,
      extension_2: extension_2,
      ...(primary && { primary: primary }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
