import type { Actions, RequestEvent } from "@sveltejs/kit"
import type { ManagerUpdateInput } from "$lib/graphql/types"
import type { UnpackedClass } from "$lib/util/helpers"

export const actions: Actions = {
  default: async ({ request, params }: RequestEvent): Promise<ManagerUpdateInput> => {
    const data = await request.formData()
    const orgUnitUuid = data.get("org-unit-uuid")
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
      uuid: params.manager,
      ...(orgUnitUuid && { org_unit: orgUnitUuid }),
      ...(employeeUuid && { person: employeeUuid }),
      ...(managerType && { manager_type: managerType }),
      ...(managerLevel && { manager_level: managerLevel }),
      responsibility: responsibilities,
      validity: { from: startDate, ...(endDate && { to: endDate }) },
    }
  },
}
