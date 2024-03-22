import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()

    const originUuid = data.get("origin")
    const destinationUuids = data.getAll("destination")
    const startDate = data.get("from")

    return {
      origin: originUuid,
      destination: destinationUuids,
      validity: { from: startDate },
    }
  },
}
