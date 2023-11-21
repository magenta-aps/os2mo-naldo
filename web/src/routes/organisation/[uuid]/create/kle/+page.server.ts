import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { KleCreateInput } from "$lib/graphql/types"
import type { UnpackedClass } from "$lib/util/helpers"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<KleCreateInput> => {
    const data = await request.formData()
    const kleNumber = data.get("kle-number")
    // Keeping these lines as documentation for the following one-liner.
    // const jsonKleAspect = data.get("kle-aspects") as string
    // const kleAspects = JSON.parse(jsonKleAspect) as Class
    // const kle = kles.map(v => v.uuid)
    const kleAspects = (
      JSON.parse(data.get("kle-aspects") as string) as UnpackedClass
    ).map((v) => v.uuid)
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      kle_number: kleNumber,
      kle_aspects: kleAspects,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
