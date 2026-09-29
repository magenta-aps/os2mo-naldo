import type { OwnerTerminateInput } from "$lib/graphql/types"
import { dayAfter } from "$lib/utils/date"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<OwnerTerminateInput> => {
    const data = await request.formData()
    const toDate = dayAfter(data.get("to") as string | null)

    return {
      uuid: params.owner,
      to: toDate,
    }
  },
}
