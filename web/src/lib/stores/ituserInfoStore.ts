import { browser } from "$app/environment"
import { writable, get } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { date } from "$lib/stores/date"

export type ItuserInfo = {
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

export const createDefaultItuser = (): ItuserInfo => ({
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

export const validateItuser = (ituser: ItuserInfo): boolean => {
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
  const defaultValue: ItuserInfo[] = [createDefaultItuser()]

  let initialValue = defaultValue

  if (browser) {
    const stored = localStorage.getItem("ituser-info")
    initialValue = stored ? JSON.parse(stored) : defaultValue
  }

  const { subscribe, update, set } = writable<ItuserInfo[]>(initialValue)

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
      set([createDefaultItuser()])
    },
    addItuser: () => update((itusers) => [...itusers, createDefaultItuser()]),
    removeItuser: (ituserIndex: number) =>
      update((itusers) => itusers.toSpliced(ituserIndex, 1)),
    addRolebinding: (ituserIndex: number) =>
      update((itusers) => {
        const ituser = itusers[ituserIndex]
        return itusers.toSpliced(ituserIndex, 1, {
          ...ituser,
          rolebindings: [...ituser.rolebindings, createDefaultRolebinding()],
        })
      }),
    removeRolebinding: (ituserIndex: number, rolebindingIndex: number) =>
      update((itusers) => {
        const ituser = itusers[ituserIndex]
        return itusers.toSpliced(ituserIndex, 1, {
          ...ituser,
          rolebindings: ituser.rolebindings.toSpliced(rolebindingIndex, 1),
        })
      }),
    validateForm: () => {
      let isValid = false

      update((itusers) => {
        const updated = itusers.map((ituser) => {
          const validatedRolebindings = ituser.rolebindings.map((rb) => ({
            ...rb,
            validated: validateRolebinding(rb),
          }))

          const validatedItuser = {
            ...ituser,
            validated: validateItuser(ituser),
            rolebindings: validatedRolebindings,
          }

          return validatedItuser
        })

        isValid = updated.every(
          (ituser) =>
            ituser.validated && ituser.rolebindings.every((rb) => rb.validated)
        )

        return updated
      })
      return isValid
    },
  }
})()
