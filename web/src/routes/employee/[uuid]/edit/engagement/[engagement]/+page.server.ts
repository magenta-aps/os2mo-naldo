import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EngagementUpdateInput } from "$lib/graphql/types"

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
    const primary = data.get("primary") ? data.get("primary") : data.get("non-primary")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.engagement,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      ...(userKey && { user_key: userKey }),
      ...(engagementType && { engagement_type: engagementType }),
      ...(jobFunction && { job_function: jobFunction }),
      primary: primary,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
