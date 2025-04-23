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
    const primary = data.get("primary") ? data.get("primary") : data.get("non-primary")
    const notes = data.get("notes") as string
    const startDate = data.get("from")
    const endDate = data.get("to")
    // Rolebinding data
    const roles = data.getAll("it-system-role-uuid") as string[]
    const rolebindingStartDate = data.get("rolebinding-from")
    const rolebindingEndDate = data.get("rolebinding-to")

    return {
      itUserInput: {
        uuid: itUserUuid,
        person: params.uuid,
        itsystem: itSystem,
        user_key: accountName,
        primary: primary,
        ...(notes && { note: notes }),
        validity: { from: startDate, ...(endDate && { to: endDate }) },
      },
      rolebindingInput: roles.map((role: string) => ({
        ituser: itUserUuid,
        role: role,
        validity: {
          from: rolebindingStartDate,
          ...(rolebindingEndDate && { to: rolebindingEndDate }),
        },
      })),
    }
  },
}
