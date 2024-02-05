import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ClassCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ClassCreateInput> => {
    const data = await request.formData()
    const facet = data.get("facet")
    const name = data.get("name") as string
    const startDate = data.get("from")
    // const endDate = data.get("to")

    return {
      facet_uuid: facet,
      name: name,
      user_key: name,
      validity: { from: startDate },
      // FIXME: (don't know which prefix to use)
      // Commented out for now, but will probably be needed at some point:
      // https://redmine.magenta.dk/issues/58396
      // validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
