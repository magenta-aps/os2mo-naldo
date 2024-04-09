import type { EmployeeUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<EmployeeUpdateInput> => {
    const data = await request.formData()
    const first_name = data.get("first-name") as string
    const last_name = data.get("last-name") as string
    const nicknameFirstName = data.get("nickname-first-name") as string
    const nicknameLastName = data.get("nickname-last-name") as string
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.uuid,
      given_name: first_name,
      surname: last_name,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(nicknameFirstName && { nickname_given_name: nicknameFirstName }),
      ...(nicknameLastName && { nickname_surname: nicknameLastName }),
    }
  },
}
