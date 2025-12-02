import type { OrganisationUnitTerminateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<OrganisationUnitTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")

    return {
      uuid: params.uuid,
      to: toDate,
    }
  },
}
