import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerCreateInput } from "$lib/graphql/types"
import type { UnpackedClass } from "$lib/util/helpers"

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
    const responsibilities = (
      JSON.parse(data.get("responsibility") as string) as UnpackedClass
    ).map((v) => v.uuid)
    const startDate = data.get("from")
    const endDate = data.get("to")

    return {
      org_unit: params.uuid,
      ...(employeeUuid && { person: employeeUuid }),
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: responsibilities,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
