import type { RolebindingRuleCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<RolebindingRuleCreateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const active = data.get("active") === "true"
    const role = data.get("role-uuid") as string
    const expression = data.get("expression") as string

    return {
      name: name,
      active: active,
      role: role,
      expression: expression,
    }
  },
}
