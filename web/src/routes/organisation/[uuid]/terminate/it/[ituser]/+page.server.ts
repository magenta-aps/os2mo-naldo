import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<any> => {
    const data = await request.formData()

    console.log(data)
    const query = `
      mutation MyMutation($input: ITUserTerminateInput) {
        ituser_terminate(input: $input) {
          uuid
        }
      }
    `
    return {
      query,
      variables: {
        input: {
          uuid: params.ituser,
          validity: { to: data.get("to") },
        },
      },
    }
  },
}
