import {
  createDefaultEmployeeValues,
  type EmployeeValues,
} from "$lib/components/forms/entity/types"
import { createSingleStepStore, type Validatable } from "$lib/stores/createStepStore"
import { isValidCpr } from "$lib/utils/cpr"

export type EmployeeInfo = EmployeeValues & Validatable

export const validateEmployee = (employee: EmployeeInfo): boolean => {
  return (
    !!employee.firstName &&
    !!employee.lastName &&
    !!employee.cprNumber &&
    isValidCpr(employee.cprNumber.cpr_no)
  )
}

export const employeeInfo = createSingleStepStore<EmployeeInfo>(
  createDefaultEmployeeValues,
  validateEmployee
)
