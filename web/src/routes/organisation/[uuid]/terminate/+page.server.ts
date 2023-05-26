import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const endDate = data.get("end-date")
    const org = data.get("select-org-tree")

    return {
      org: org,
      // Validity
      // End format YYYY-mm-dd
      to: endDate,
    }
  },
}
