import type { RolebindingRuleUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<RolebindingRuleUpdateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const active = data.get("active") === "true"
    const expression = data.get("expression") as string

    return {
      uuid: params.rule,
      name: name,
      active: active,
      expression: expression,
    }
  },
}
