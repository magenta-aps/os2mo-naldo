import { browser } from "$app/environment"
import { writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"

type EmployeeInfo = {
  uuid: string
  cprNumber: { name: string; cpr_no: string }
  firstName: string
  lastName: string
  nicknameFirstname: string
  nicknameLastname: string
  validated: boolean
}

const defaultValue: EmployeeInfo = {
  uuid: uuidv4(),
  cprNumber: { name: "", cpr_no: "" },
  firstName: "",
  lastName: "",
  nicknameFirstname: "",
  nicknameLastname: "",
  validated: false,
}

const createEmployeeInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedEmployeeInfo = localStorage.getItem("employee-info")
    initialValue = storedEmployeeInfo ? JSON.parse(storedEmployeeInfo) : defaultValue
  }

  const { subscribe, update, set } = writable<EmployeeInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("employee-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((employeeStore) => {
      employeeStore.validated = valid
      return employeeStore
    })
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("employee-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const employeeInfo = createEmployeeInfoStore()
