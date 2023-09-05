import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ItAssociationTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<ItAssociationTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.itassociation,
      to: toDate,
    }
  },
}
