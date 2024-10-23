import type { RoleBindingCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<RoleBindingCreateInput> => {
    const data = await request.formData()
    const ituserUuid = data.get("it-user-uuid")
    const roleUuid = data.get("role-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      ituser: ituserUuid,
      role: roleUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
