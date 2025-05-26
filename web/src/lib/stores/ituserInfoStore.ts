import { browser } from "$app/environment"
import { writable, get } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { date } from "$lib/stores/date"

export type ItUserInfo = {
  uuid: string
  fromDate: string
  toDate: string
  itSystem: { uuid: string; name: string }
  userkey: string
  notes: string
  primary: { uuid: string; name?: string; user_key: string }
  rolebindings: RolebindingInfo[]
  validated: boolean
}

export const createDefaultItUser = (): ItUserInfo => ({
  uuid: uuidv4(),
  fromDate: get(date),
  toDate: "",
  itSystem: { uuid: "", name: "" },
  userkey: "",
  notes: "",
  primary: { uuid: "", name: "", user_key: "" },
  rolebindings: [],
  validated: false,
})

export type RolebindingInfo = {
  // Disabled for now, since `ituser dates == rolebinding dates` on creation
  // fromDate: string
  // toDate: string
  role: { uuid: string; name: string; user_key: string }
  validated: boolean
}

export const createDefaultRolebinding = (): RolebindingInfo => ({
  // Disabled for now, since `ituser dates == rolebinding dates` on creation
  // fromDate: get(date),
  // toDate: "",
  role: { uuid: "", name: "", user_key: "" },
  validated: false,
})

export const validateRolebinding = (rb: RolebindingInfo): boolean => {
  return Boolean(rb.role?.uuid)
}

export const ituserInfo = (() => {
  const defaultValue: ItUserInfo[] = [createDefaultItUser()]

  let initialValue = defaultValue

  if (browser) {
    const stored = localStorage.getItem("ituser-info")
    initialValue = stored ? JSON.parse(stored) : defaultValue
  }

  const { subscribe, update, set } = writable<ItUserInfo[]>(initialValue)

  // Save to localStorage on any change
  subscribe((value) => {
    if (browser) localStorage.setItem("ituser-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    update,
    reset: () => {
      if (browser) localStorage.removeItem("ituser-info")
      set([createDefaultItUser()])
    },
    addItUser: (newUser: ItUserInfo) => update((users) => [...users, newUser]),
    // Flexible updater
    updateItUserAtIndex: (index: number, updater: (user: ItUserInfo) => ItUserInfo) =>
      update((users) => users.map((user, i) => (i === index ? updater(user) : user))),

    addRolebinding: (userIndex: number) =>
      update((users) =>
        users.map((user, i) =>
          i === userIndex
            ? {
                ...user,
                rolebindings: [...user.rolebindings, createDefaultRolebinding()],
              }
            : user
        )
      ),
    removeRolebinding: (userIndex: number, rolebindingIndex: number) =>
      update((users) =>
        users.map((user, i) =>
          i === userIndex
            ? {
                ...user,
                rolebindings: user.rolebindings.filter(
                  (_, j) => j !== rolebindingIndex
                ),
              }
            : user
        )
      ),
    isValid: (valid: boolean) =>
      update((users) =>
        users.map((user) => ({
          ...user,
          validated: valid,
        }))
      ),
  }
})()
