import type { Actions } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    const org = data.get("select-org-tree")
    const parent = data.get("select-parent-org-tree")
    const moveDate = data.get("move-date")

    return {
      uuid: org,
      parent: parent,
      validity: {
        // End format YYYY-mm-dd
        from: moveDate,
        to: moveDate,
      },
    }
  },
}
