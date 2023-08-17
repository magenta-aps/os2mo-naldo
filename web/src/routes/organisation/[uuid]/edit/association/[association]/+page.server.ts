import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { AssociationUpdateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationUpdateInput> => {
    const data = await request.formData()
    const associationType = data.get("association-type")
    const employeeUuid = data.get("employee-uuid")
    const primary = data.get("primary")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.association,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(associationType && { association_type: associationType }),
      ...(employeeUuid && { employee: employeeUuid }),
      ...(primary && { primary: primary }),
    }
  },
}
