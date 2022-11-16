import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<any> => {
    const data = await request.formData()

    // Yep...
    const primary = data.get("primary")
      ? "0644cd06-b84b-42e0-95fe-ce131c21fbe6"
      : "afe0910b-df1f-478d-a62b-aa02492b3f67"

    const query = `
      mutation FrontendITUserUpdate($input: ITUserUpdateInput!) {
        ituser_update(input: $input) {
          uuid
        }
      }
    `

    // return {
    //   query,
    //   variables: {
    //     input: {
    //       uuid: params.uuid,
    //       validity: { from: startDate, ...(endDate && { to: endDate }) },
    //       ...(name && { name: name }),
    //       ...(parent && { parent: parent }),
    //       ...(orgLevel && { org_unit_level: orgLevel }),
    //       ...(orgType && { org_unit_type: orgType }),
    return {
      query,
      variables: {
        input: {
          uuid: params.ituser,
          primary,
          validity: {
            from: data.get("from"),
            ...(data.get("to") && { to: data.get("to") }),
          },
          ...(data.get("itsystem") && { itsystem: data.get("itsystem") }),
          ...(data.get("user-key") && { user_key: data.get("user-key") }),
        },
      },
    }
  },
}
