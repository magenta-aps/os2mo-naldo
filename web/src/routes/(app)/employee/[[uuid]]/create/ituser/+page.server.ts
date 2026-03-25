import type { ItUserCreateInput, RoleBindingCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"
import { v4 as uuidv4 } from "uuid"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<{
    itUserInput: ItUserCreateInput
    rolebindingInput?: RoleBindingCreateInput[]
  }> => {
    const data = await request.formData()

    // Ituser data
    const itUserUuid = uuidv4()
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
    // Rolebinding data
    const roles = data.getAll("it-system-role-uuid") as string[]

    return {
      itUserInput: {
        uuid: itUserUuid,
        person: params.uuid,
        itsystem: itSystem,
        user_key: accountName,
        ...(primary && { primary: primary }),
        ...(externalId && { external_id: externalId }),
        ...(notes && { note: notes }),
        ...(engagements.length && { engagements: engagements }),
        validity: { from: startDate, ...(endDate && { to: endDate }) },
      },
      rolebindingInput: roles.map((role: string) => ({
        ituser: itUserUuid,
        role: role,
        // Use ituser dates
        validity: { from: startDate, ...(endDate && { to: endDate }) },
      })),
    }
  },
}
