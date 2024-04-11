import type { EmployeeTerminateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent): Promise<EmployeeTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")
    const employee = data.get("employee-uuid")

    return {
      uuid: employee,
      to: toDate,
    }
  },
}
