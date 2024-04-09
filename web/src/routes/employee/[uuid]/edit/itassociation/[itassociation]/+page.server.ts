import type { ItAssociationUpdateInput } from "$lib/graphql/types"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<ItAssociationUpdateInput> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit-uuid")
    const itUser = data.get("it-user-uuid")
    const jobFunction = data.get("job-function")
    const primary = data.get("primary") ? data.get("primary") : data.get("non-primary")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.itassociation,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      ...(itUser && { it_user: itUser }),
      ...(jobFunction && { job_function: jobFunction }),
      ...(primary && { primary: primary }),
    }
  },
}
