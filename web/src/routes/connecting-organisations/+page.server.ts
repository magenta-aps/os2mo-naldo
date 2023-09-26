import type { RelatedUnitsUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<RelatedUnitsUpdateInput> => {
    const data = await request.formData()
    const startDate = data.get("from")
    const originUuid = data.get("origin-uuid")
    const destinationUuids = data.getAll("destination-uuids")

    /* destinationUuids modtager en string som FormDataEntryValue[], 
    men promise forventer et array af strings defor denne modificering af data */
    let uuidArray: string[] = []
    const destinationUuidsString =
      destinationUuids.length > 0 ? destinationUuids[0] : ""
    if (typeof destinationUuidsString === "string") {
      uuidArray = destinationUuidsString.split(",")
      console.log(uuidArray)
    }

    return {
      validity: { from: startDate },
      origin: originUuid,
      destination: uuidArray,
    }
  },
}
