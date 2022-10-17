import type { Actions } from "@sveltejs/kit"
import { postRest } from "$lib/util/http"
import { keycloak } from "$lib/util/keycloak"
import { env } from "$env/dynamic/public"

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    const org = data.get("select-org-tree")
    const parent = data.get("select-parent-org-tree")
    const moveDate = data.get("move-date")

    // const postRest = async (path: string, payload: any) => {
    //   const token = keycloak ? keycloak.token : "Keycloak disabled"
    //   return await event.fetch(`${env.PUBLIC_BASE_URL}/service/${path}`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: "Bearer " + token,
    //     },
    //     body: JSON.stringify(payload),
    //   })
    // }

    // const resTwo = await postRest(`validate/candidate-parent-org-unit/`, {
    //   org_unit: { uuid: org },
    //   parent: { uuid: parent },
    //   validity: { from: moveDate },
    // })

    // const jsonTwo = await resTwo.json()
    // console.log(jsonTwo)

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
