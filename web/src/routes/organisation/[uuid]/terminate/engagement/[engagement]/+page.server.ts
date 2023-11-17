import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EngagementTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<EngagementTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.engagement,
      to: toDate,
    }
  },
}
