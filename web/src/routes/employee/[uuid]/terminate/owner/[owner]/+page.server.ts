import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OwnerTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.owner,
      to: toDate,
    }
  },
}
