import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { OrganisationUnitTerminateInput } from "$lib/graphql/types"

export const actions: Actions = {
  default: async ({
    request,
  }: RequestEvent): Promise<OrganisationUnitTerminateInput> => {
    const data = await request.formData()
    const toDate = data.get("to")
    const orgUnit = data.get("org-unit-uuid")

    return {
      uuid: orgUnit,
      to: toDate,
    }
  },
}
