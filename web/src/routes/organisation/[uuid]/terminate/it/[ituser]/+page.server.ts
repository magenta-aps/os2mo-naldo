import type { Actions, RequestEvent } from "@sveltejs/kit"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<any> => {
    const data = await request.formData()

    const query = `
      mutation FrontendITUserTerminate($input: ITUserTerminateInput!) {
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
          to: data.get("to"),
        },
      },
    }
  },
}
