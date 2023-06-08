import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { AssociationTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.association,
      to: toDate,
    }
  },
}
