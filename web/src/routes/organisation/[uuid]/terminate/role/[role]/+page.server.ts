import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RoleTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<RoleTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.role,
      to: toDate,
    }
  },
}
