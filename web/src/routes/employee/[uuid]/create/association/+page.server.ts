import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { AssociationCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationCreateInput> => {
    const data = await request.formData()
    const associationType = data.get("association-type")
    const orgUnitUuid = data.get("org-unit-uuid")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      employee: params.uuid,
      org_unit: orgUnitUuid,
      association_type: associationType,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
