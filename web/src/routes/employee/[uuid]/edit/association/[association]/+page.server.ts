import type { AssociationUpdateInput } from "$lib/graphql/types"
import type { UnpackedClass } from "$lib/util/helpers"
import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({
    request,
    params,
  }: RequestEvent): Promise<AssociationUpdateInput> => {
    const data = await request.formData()
    const associationType = data.get("association-type")
    const orgUnitUuid = data.get("org-unit-uuid")
    const primary = data.get("primary")
    const substitute = data.get("substitute")
    const tradeUnion = data.get("trade-union")
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      uuid: params.association,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(associationType && { association_type: associationType }),
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      ...(primary && { primary: primary }),
      ...(substitute && { substitute: substitute }),
      ...(tradeUnion && { trade_union: tradeUnion }),
    }
  },
}
