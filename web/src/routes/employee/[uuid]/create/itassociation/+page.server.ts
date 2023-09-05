import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ItAssociationCreateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<ItAssociationCreateInput> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit-uuid")
    const itUser = data.get("it-user-uuid")
    const primary = data.get("primary") ? data.get("primary") : data.get("non-primary")
    const jobFunction = data.get("job-function")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      person: params.uuid,
      org_unit: orgUnitUuid,
      it_user: itUser,
      job_function: jobFunction,
      primary: primary,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
