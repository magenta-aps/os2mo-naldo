import { browser } from "$app/environment"
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

const cprRegex = /^\d{6}\d{4}$/

export const validateEmployee = (employee: EmployeeInfo): boolean => {
  return (
    !!employee.firstName &&
    !!employee.lastName &&
    !!employee.cprNumber &&
    cprRegex.test(employee.cprNumber.cpr_no)
  )
}

export const employeeInfo = (() => {
  const defaultValue: EmployeeInfo = createDefaultEmployee()

  let initialValue = defaultValue

  if (browser) {
    const storedEmployeeInfo = localStorage.getItem("employee-info")
    initialValue = storedEmployeeInfo ? JSON.parse(storedEmployeeInfo) : defaultValue
  }

  const { subscribe, update, set } = writable<EmployeeInfo>(initialValue)

  subscribe((value) => {
    if (browser) localStorage.setItem("employee-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    update,
    reset: () => {
      if (browser) localStorage.removeItem("employee-info")
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
