import { browser } from "$app/environment"
import { writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"

type EmployeeInfo = {
  uuid: string
  cprNumber: string
  firstName: string
  lastName: string
  nicknameFirstname: string
  nicknameLastname: string
}

const defaultValue: EmployeeInfo = {
  uuid: uuidv4(),
  cprNumber: "",
  firstName: "",
  lastName: "",
  nicknameFirstname: "",
  nicknameLastname: "",
}

const createEmployeeInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedEmployeeInfo = localStorage.getItem("employee-info")
    initialValue = storedEmployeeInfo ? JSON.parse(storedEmployeeInfo) : defaultValue
  }

  const { subscribe, set } = writable<EmployeeInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("employee-info")
    set(defaultValue)
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("employee-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
  }
}

export const employeeInfo = createEmployeeInfoStore()
