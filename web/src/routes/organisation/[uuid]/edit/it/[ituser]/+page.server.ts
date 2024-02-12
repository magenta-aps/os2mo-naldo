import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ItUserUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ItUserUpdateInput> => {
    const data = await request.formData()
    const itSystem = data.get("it-system")
    const accountName = data.get("account-name") as string
    const primary = data.get("primary") ? data.get("primary") : data.get("non-primary")
    const notes = data.get("notes") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.ituser,
      primary: primary,
      ...(accountName && { user_key: accountName }),
      ...(itSystem && { itsystem: itSystem }),
      ...(notes && { note: notes }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
