import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { get } from "svelte/store"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()

    const originUuid = data.get("origin")
    const destinationUuids = data.getAll("destination")

    return {
      validity: { from: get(date) },
      origin: originUuid,
      destination: destinationUuids,
    }
  },
}
