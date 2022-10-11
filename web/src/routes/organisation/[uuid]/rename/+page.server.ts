import type { Actions } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    const name = data.get("name")
    const org = data.get("select-org-tree")
    const startDate = data.get("start-date")

    return {
      name: name,
      uuid: org,
      validity: {
        // End format YYYY-mm-dd
        from: startDate,
      },
    }
  },
}
