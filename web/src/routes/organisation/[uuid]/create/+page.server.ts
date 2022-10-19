import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const name = data.get("name")
    const parent = data.get("select-org-tree")
    const orgLevel = data.get("org-level")
    const orgType = data.get("org-type")
    const startDate = data.get("start-date")
    const endDate = data.get("end-date")

    const details: string[] = []
    for (let i of data.entries()) {
      if (i[0].startsWith("detail-")) {
        details.push(JSON.parse(i[1].toString()))
      }
    }

    return {
      name: name,
      parent: { uuid: parent },
      org_unit_level: { uuid: orgLevel },
      org_unit_type: { uuid: orgType },
      validity: {
        // End format YYYY-mm-dd
        from: startDate,
        to: endDate ? endDate : undefined,
      },
      details: details,
    }
  },
}
