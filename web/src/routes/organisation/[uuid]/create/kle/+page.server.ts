import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { KleCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<KleCreateInput> => {
    const data = await request.formData()
    const kleNumber = data.get("kle-number")
    const kleAspect = data.get("kle-aspect")
    // Needs support for adding more than 1 KLE aspect
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      kle_number: kleNumber,
      kle_aspects: [kleAspect],
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
