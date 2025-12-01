import type { AddressCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"
import { v4 as uuidv4 } from "uuid"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<AddressCreateInput> => {
    const addressUuid = uuidv4()
    const data = await request.formData()
    const addressType = data.get("address-type-uuid")
    const visibility = data.get("visibility")
    const userKey = data.get("user-key") as string
    const value = data.get("value") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: addressUuid,
      person: params.uuid,
      address_type: addressType,
      user_key: userKey || addressUuid,
      value: value,
      ...(visibility && { visibility: visibility }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
