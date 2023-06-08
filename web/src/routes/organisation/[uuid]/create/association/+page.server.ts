import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { AssociationCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationCreateInput> => {
    const data = await request.formData()
    const associationType = data.get("association-type")
    const employeeUuid = data.get("employee-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.association,
      org_unit: params.uuid,
      employee: employeeUuid,
      association_type: associationType,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
