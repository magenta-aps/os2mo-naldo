import type { RoleBindingCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<{ rolebindingInput: RoleBindingCreateInput[] }> => {
    const data = await request.formData()
    const ituserUuid = data.get("it-user-uuid")
    const roles = data.getAll("role-uuid") as string[]
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      rolebindingInput: roles.map((role: string) => ({
        ituser: ituserUuid,
        role: role,
        validity: { from: startDate, ...(endDate && { to: endDate }) },
      })),
    }
  },
}
