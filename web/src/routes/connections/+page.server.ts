import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()

    const originUuid = data.get("origin")
    const destinationUuids = data.getAll("destination")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      origin: originUuid,
      destination: destinationUuids,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
