import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"

type UnpackedClass = {
  name: string
  uuid: string
}[]
export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()
    const startDate = data.get("from")
    const originUuid = data.get("origin-uuid")

    const destinationUuids = (
      JSON.parse(data.get("destination-uuids") as string) as UnpackedClass
    ).map((v) => v.uuid)

    return {
      validity: { from: startDate },
      origin: originUuid,
      destination: destinationUuids,
    }
  },
}
