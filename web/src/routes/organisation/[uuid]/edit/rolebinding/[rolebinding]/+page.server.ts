import type { RoleBindingUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<RoleBindingUpdateInput> => {
    const data = await request.formData()
    const ituserUuid = data.get("it-user-uuid")
    const roleUuid = data.get("it-system-role-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.rolebinding,
      ituser: ituserUuid,
      role: roleUuid,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
