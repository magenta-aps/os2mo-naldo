import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    const name = data.get("name")
    const parent = data.get("select-org-tree")
    const orgLevel = data.get("org-level")
    const orgType = data.get("org-type")
    const startDate = data.get("start-date")
    const endDate = data.get("end-date")
    const addressType = data.get("address-type")

    console.log("---server---");
    console.log("formdata", Object.fromEntries(data.entries()))


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
      // TODO: Details
      details: addressType,
    }
  }
};
