import type { AssociationCreateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationCreateInput> => {
    const data = await request.formData()
    const associationType = data.get("association-type")
    const orgUnitUuid = data.get("org-unit-uuid")
    const primary = data.get("primary")
    // TODO: Uncomment when graphQL is ready
    // Also add in the `return`
    // const medOrg = data.get("med-org")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      person: params.uuid,
      org_unit: orgUnitUuid,
      association_type: associationType,
      ...(primary && { primary: primary }),
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
