import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ItUserTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ItUserTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.ituser,
      to: toDate,
    }
  },
}
