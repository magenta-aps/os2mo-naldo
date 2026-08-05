import { env } from "$lib/env"
import type { ItUserUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ItUserUpdateInput> => {
    const data = await request.formData()
    const itSystem = data.get("it-system")
    const accountName = data.get("account-name") as string
    const primary = data.get("primary")
    const externalId = data.get("external-id") as string
    const notes = data.get("notes") as string
    const engagements = data.get("engagements")
      ? (JSON.parse(data.get("engagements") as string) as { uuid: string }[]).map(
          (v) => v.uuid
        )
      : []
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.ituser,
      ...(primary && { primary: primary }),
      ...(accountName && { user_key: accountName }),
      ...(itSystem && { itsystem: itSystem }),
      external_id: externalId,
      note: notes,
      ...(env.PUBLIC_SHOW_ITUSER_CONNECTIONS && { engagements: engagements }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
