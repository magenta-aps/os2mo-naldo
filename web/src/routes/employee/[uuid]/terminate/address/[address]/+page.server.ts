import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { AddressTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AddressTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.address,
      to: toDate,
    }
  },
}
