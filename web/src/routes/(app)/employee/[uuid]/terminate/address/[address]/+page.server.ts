import type { AddressTerminateInput } from "$lib/graphql/types"
import { exclusiveTo } from "$lib/utils/date"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AddressTerminateInput> => {
    const data = await request.formData()
    const toDate = exclusiveTo(data.get("to") as string | null)

    return {
      uuid: params.address,
      to: toDate,
    }
  },
}
