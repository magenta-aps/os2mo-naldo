import type { AssociationCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

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
    const primary = data.get("primary")

    return {
      uuid: params.association,
      org_unit: params.uuid,
      person: employeeUuid,
      association_type: associationType,
      primary: primary,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
