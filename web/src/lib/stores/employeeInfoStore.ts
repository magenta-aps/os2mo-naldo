import { v4 as uuidv4 } from "uuid"
import { isValidCpr } from "$lib/utils/cpr"
import { createSingleStepStore } from "$lib/stores/createStepStore"

export type EmployeeInfo = {
  uuid: string
  cprNumber: { name: string; cpr_no: string }
  firstName: string
  lastName: string
  nicknameFirstname: string
  nicknameLastname: string
  validated?: boolean
}

export const createDefaultEmployee = (): EmployeeInfo => ({
  uuid: uuidv4(),
  cprNumber: { name: "", cpr_no: "" },
  firstName: "",
  lastName: "",
  nicknameFirstname: "",
  nicknameLastname: "",
  validated: undefined,
})

export const validateEmployee = (employee: EmployeeInfo): boolean => {
  return (
    !!employee.firstName &&
    !!employee.lastName &&
    !!employee.cprNumber &&
    isValidCpr(employee.cprNumber.cpr_no)
  )
}

export const employeeInfo = createSingleStepStore(
  createDefaultEmployee,
  validateEmployee
)
