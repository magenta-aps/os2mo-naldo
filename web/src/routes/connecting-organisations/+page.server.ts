import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()
    const originUuid = data.get("origin-uuid")
    const destinationUuid = data.get("destination-uuid")
    const startDate = data.get("from")

    return {
      validity: { from: startDate },
      ...(originUuid && { origin: originUuid }),
      ...(destinationUuid && { destination: destinationUuid }),
    }
  },
}
