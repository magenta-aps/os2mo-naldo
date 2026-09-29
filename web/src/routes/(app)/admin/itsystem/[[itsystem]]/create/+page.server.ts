import type { ItSystemCreateInput } from "$lib/graphql/types"
import { dayAfter } from "$lib/utils/date"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<ItSystemCreateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const userKey = data.get("user-key") as string
    const startDate = data.get("from")
    const endDate = dayAfter(data.get("to") as string | null)

    return {
      name: name,
      user_key: userKey,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
