import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EmployeeCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EmployeeCreateInput> => {
    const data = await request.formData()
    const cprNumber = data.get("cpr-number") as string
    const firstName = data.get("first-name") as string
    const lastName = data.get("last-name") as string
    const nicknameFirstName = data.get("nickname-first-name") as string
    const nicknameLastName = data.get("nickname-last-name") as string
    const seniority = data.get("seniority")

    return {
      given_name: firstName,
      surname: lastName,
      ...(cprNumber && { cpr_number: cprNumber }),
      ...(nicknameFirstName && { nickname_given_name: nicknameFirstName }),
      ...(nicknameLastName && { nickname_surname: nicknameLastName }),
      ...(seniority && { seniority: seniority }),
    }
  },
}
