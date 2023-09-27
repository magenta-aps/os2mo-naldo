import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerCreateInput } from "$lib/graphql/types"

type UnpackedClass = {
  name: string
  uuid: string
  user_key: string
}[]

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ManagerCreateInput> => {
    const data = await request.formData()
    const employeeUuid = data.get("employee-uuid")
    const managerType = data.get("manager-type")
    const managerLevel = data.get("manager-level")
    // Keeping these lines as documentation for the following one-liner.
    // const jsonResponsibility = data.get("responsibility") as string
    // const responsibility = JSON.parse(jsonResponsibility) as Class
    // const resp = responsibility.map(v => v.uuid)
    const resp = (
      JSON.parse(data.get("responsibility") as string) as UnpackedClass
    ).map((v) => v.uuid)
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: resp,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
      ...(employeeUuid && { person: employeeUuid }),
    }
  },
}
