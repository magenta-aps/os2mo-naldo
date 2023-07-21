import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { EmployeeCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<EmployeeCreateInput> => {
    const data = await request.formData()
    const CprNumber = data.get("cpr-number") as string
    const firstName = data.get("first-name") as string
    const lastName = data.get("last-name") as string
    const nicknameFirstName = data.get("nickname-first-name") as string
    const nicknameLastName = data.get("nickname-last-name") as string
    const seniority = data.get("seniority")

    return {
      givenname: firstName,
      surname: lastName,
      ...(CprNumber && { cpr_number: CprNumber }),
      ...(nicknameFirstName && { nickname_given_name: nicknameFirstName }),
      ...(nicknameLastName && { nickname_surname: nicknameLastName }),
      ...(seniority && { seniority: seniority }),
    }
  },
}
