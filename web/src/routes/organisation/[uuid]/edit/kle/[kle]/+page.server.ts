import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { KleUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<KleUpdateInput> => {
    const data = await request.formData()
    const kleAspects = data.get("kle-aspect")
    const kleNumber = data.get("kle-number")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.kle,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...([kleAspects] && { kle_aspects: [kleAspects] }),
      ...(kleNumber && { kle_number: kleNumber }),
    }
  },
}
