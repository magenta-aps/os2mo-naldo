import type { EngagementCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<EngagementCreateInput> => {
    const data = await request.formData()
    const employeeUuid = data.get("employee-uuid")
    const userKey = data.get("user-key") as string
    const engagementType = data.get("engagement-type")
    const jobFunction = data.get("job-function")
    const extension_1 = data.get("extension-1") as string
    const extension_4 = data.get("extension-4") as string
    const primary = data.get("primary")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      person: employeeUuid,
      ...(userKey && { user_key: userKey }),
      engagement_type: engagementType,
      job_function: jobFunction,
      ...(extension_1 && { extension_1: extension_1 }),
      ...(extension_4 && { extension_4: extension_4 }),
      ...(primary && { primary: primary }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
