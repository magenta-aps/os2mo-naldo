import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EmployeeUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<EmployeeUpdateInput> => {
    const data = await request.formData()
    const name = data.get("name") as string
    const nicknameFirstName = data.get("nickname-first-name") as string
    const nicknameLastName = data.get("nickname-last-name") as string
    const seniority = data.get("seniority")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.uuid,
      name: name,
      from: startDate,
      ...(endDate && { to: endDate }),
      ...(nicknameFirstName && { nickname_given_name: nicknameFirstName }),
      ...(nicknameLastName && { nickname_surname: nicknameLastName }),
      ...(seniority && { seniority: seniority }),
    }
  },
}
