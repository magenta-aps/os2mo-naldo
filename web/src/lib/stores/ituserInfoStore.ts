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
  validated?: boolean
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
  validated: undefined,
})

export const validateItuser = (ituser: ItUserInfo): boolean => {
  return !!ituser.fromDate && !!ituser.itSystem?.uuid && !!ituser.userkey
}

export type RolebindingInfo = {
  // Disabled for now, since `ituser dates == rolebinding dates` on creation
  // fromDate: string
  // toDate: string
  role: { uuid: string; name: string; user_key: string }
  validated?: boolean
}

export const createDefaultRolebinding = (): RolebindingInfo => ({
  // Disabled for now, since `ituser dates == rolebinding dates` on creation
  // fromDate: get(date),
  // toDate: "",
  role: { uuid: "", name: "", user_key: "" },
  validated: undefined,
})

export const validateRolebinding = (rb: RolebindingInfo): boolean => {
  return !!rb.role?.uuid
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
    addItUser: (newUser: ItUserInfo) => update((itusers) => [...itusers, newUser]),
    // Flexible updater
    updateItUserAtIndex: (index: number, updater: (ituser: ItUserInfo) => ItUserInfo) =>
      update((itusers) =>
        itusers.map((ituser, i) => (i === index ? updater(ituser) : ituser))
      ),

    addRolebinding: (ituserIndex: number) =>
      update((itusers) =>
        itusers.map((ituser, i) =>
          i === ituserIndex
            ? {
                ...ituser,
                rolebindings: [...ituser.rolebindings, createDefaultRolebinding()],
              }
            : ituser
        )
      ),
    removeRolebinding: (ituserIndex: number, rolebindingIndex: number) =>
      update((itusers) =>
        itusers.map((ituser, i) =>
          i === ituserIndex
            ? {
                ...ituser,
                rolebindings: ituser.rolebindings.filter(
                  (_, j) => j !== rolebindingIndex
                ),
              }
            : ituser
        )
      ),
    isValid: (valid: boolean) =>
      update((itusers) =>
        itusers.map((ituser) => ({
          ...ituser,
          validated: valid,
        }))
      ),
  }
})()
