import type { ClassUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ClassUpdateInput> => {
    const data = await request.formData()
    const facet = data.get("facet-uuid")
    const name = data.get("name") as string
    const startDate = data.get("from")
    // const endDate = data.get("to")

    return {
      uuid: params.class,
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
