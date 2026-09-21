import { env } from "$lib/env"
import type { AddressCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"
import { v4 as uuidv4 } from "uuid"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<AddressCreateInput> => {
    const addressUuid = uuidv4()
    const data = await request.formData()
    const addressType = data.get("address-type-uuid")
    const visibility = data.get("visibility")
    // Absent when the connections flag is off, or on the wizard's address step,
    // where the field is not rendered at all.
    const ituser = data.get("it-user-uuid")
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
      // Gated server-side too, so a stale client cannot write the relation
      // while the flag is off.
      ...(env.PUBLIC_SHOW_ITUSER_CONNECTIONS && ituser && { ituser: ituser }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
