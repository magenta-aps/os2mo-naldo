import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<any> => {
    const data = await request.formData()

    enum Primary {
      ENABLED = "0644cd06-b84b-42e0-95fe-ce131c21fbe6",
      DISABLED = "afe0910b-df1f-478d-a62b-aa02492b3f67",
    }

    const primary = data.get("primary") ? Primary.ENABLED : Primary.DISABLED

    const query = `
      mutation FrontendITUserCreate($input: ITUserCreateInput!) {
        ituser_create(input: $input) {
          uuid
        }
      }
    `
    return {
      query,
      variables: {
        input: {
          org_unit: params.uuid,
          primary,
          validity: {
            from: data.get("from"),
            ...(data.get("to") && { to: data.get("to") }),
          },
          itsystem: data.get("itsystem"),
          user_key: data.get("user-key"),
          type: "it",
        },
      },
    }
  },
}
