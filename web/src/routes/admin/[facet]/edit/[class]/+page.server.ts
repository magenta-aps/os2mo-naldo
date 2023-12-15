import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ClassUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ClassUpdateInput> => {
    const data = await request.formData()
    const facet = data.get("facet-uuid")
    const name = data.get("name") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.class,
      facet_uuid: facet,
      name: name,
      user_key: name,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
