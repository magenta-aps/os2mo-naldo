import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ItUserUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ItUserUpdateInput> => {
    const data = await request.formData()

    enum Primary {
      ENABLED = "0644cd06-b84b-42e0-95fe-ce131c21fbe6",
      DISABLED = "afe0910b-df1f-478d-a62b-aa02492b3f67",
    }

    const primary = data.get("primary") ? Primary.ENABLED : Primary.DISABLED
    const fromDate = data.get("from")
    const toDate = data.get("to")
    const itsystem = data.get("itsystem")
    const userKey = data.get("user-key") as string

    return {
      uuid: params.ituser,
      primary,
      validity: {
        from: fromDate,
        ...(toDate && { to: toDate }),
      },
      ...(itsystem && { itsystem: itsystem }),
      ...(userKey && { user_key: userKey }),
    }
  },
}
