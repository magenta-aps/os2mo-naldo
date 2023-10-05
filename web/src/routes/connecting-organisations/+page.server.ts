import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()
    const startDate = data.get("from")
    const originUuid = data.get("origin-uuid")

    const destinationUuidsEntry = data.getAll("destination-uuids")[0]
    /* Tjek at destinationUuidsEntry er en streng   og at den ikke er tom (for at TypeScript tillader `.split()` metoden) */
    const destinationUuids =
      typeof destinationUuidsEntry === "string" && destinationUuidsEntry
        ? destinationUuidsEntry.split(",").filter(Boolean)
        : []

    return {
      validity: { from: startDate },
      origin: originUuid,
      destination: destinationUuids,
    }
  },
}
