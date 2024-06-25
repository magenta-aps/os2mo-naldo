import type { ClassCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ClassCreateInput> => {
    const data = await request.formData()
    const facet = data.get("facet")
    const name = data.get("name") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      facet_uuid: facet,
      name: name,
      user_key: name,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
