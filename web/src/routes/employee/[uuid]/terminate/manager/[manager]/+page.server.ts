import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<ManagerTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.manager,
      to: toDate,
    }
  },
}
