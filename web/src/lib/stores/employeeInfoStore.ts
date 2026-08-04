import { isValidCpr } from "$lib/utils/cpr"
import { writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"

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

export const employeeInfo = (() => {
  const defaultValue: EmployeeInfo = createDefaultEmployee()

  const { subscribe, update, set } = writable<EmployeeInfo>(defaultValue)

  return {
    subscribe,
    set,
    update,
    reset: () => {
      set(createDefaultEmployee())
    },
    validateForm: () => {
      let isValid = false
      update((employee) => {
        const validated = validateEmployee(employee)
        isValid = validated

        return { ...employee, validated }
      })
      return isValid
    },
  }
})()
