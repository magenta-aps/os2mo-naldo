import type { ClassCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ClassCreateInput> => {
    const data = await request.formData()
    const facet = data.get("facet")
    const name = data.get("name") as string
    const userKey = data.get("user-key") as string
    const itsystem = data.get("itsystem")
    const scope = data.get("scope") as string | null
    const owner = data.get("org-unit-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      facet_uuid: facet,
      name: name,
      user_key: userKey,
      ...(itsystem && { it_system_uuid: itsystem }),
      ...(scope && { scope: scope }),
      ...(owner && { owner: owner }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
