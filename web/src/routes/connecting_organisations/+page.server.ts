import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { get } from "svelte/store"

type UnpackedClass = {
  name: string
  uuid: string
}[]
export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()
    const originUuid = data.get("origin-uuid")

    const destinationUuids = (
      JSON.parse(data.get("destination-uuids") as string) as UnpackedClass
    ).map((v) => v.uuid)

    return {
      validity: { from: get(date) },
      origin: originUuid,
      destination: destinationUuids,
    }
  },
}
