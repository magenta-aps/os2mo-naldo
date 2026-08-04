import { get } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { date } from "$lib/stores/date"
import { env } from "$lib/env"
import { createMultiStepStore } from "$lib/stores/createStepStore"

export type ItuserInfo = {
  uuid: string
  fromDate: string
  toDate: string
  itSystem: { uuid: string; name: string }
  userkey: string
  notes: string
  primary: { uuid: string; name: string; userkey: string }
  rolebindings: RolebindingInfo[]
  validated?: boolean
}

export const createDefaultItuser = (): ItuserInfo => ({
  uuid: uuidv4(),
  fromDate: get(date),
  toDate: "",
  itSystem: { uuid: "", name: "" },
  userkey: env.PUBLIC_SKATTESTYRELSEN_USERFLOW ? "nanoq-brugernavn" : "",
  notes: "",
  primary: { uuid: "", name: "", userkey: "" },
  rolebindings: [createDefaultRolebinding()],
  validated: undefined,
})

export const validateItuser = (ituser: ItuserInfo): boolean => {
  return !!ituser.fromDate && !!ituser.itSystem?.uuid && !!ituser.userkey
}

export type RolebindingInfo = {
  // `ituser dates == rolebinding dates` on creation, so rolebindings carry no
  // dates of their own here.
  role: { uuid: string; name: string; user_key: string }
  validated?: boolean
}

export const createDefaultRolebinding = (): RolebindingInfo => ({
  role: { uuid: "", name: "", user_key: "" },
})

const store = createMultiStepStore(createDefaultItuser, validateItuser)

export const ituserInfo = {
  ...store,
  addItuser: store.addItem,
  removeItuser: store.removeItem,
  addRolebinding: (ituserIndex: number) =>
    store.update((itusers) => {
      const ituser = itusers[ituserIndex]
      return itusers.toSpliced(ituserIndex, 1, {
        ...ituser,
        rolebindings: [...ituser.rolebindings, createDefaultRolebinding()],
      })
    }),
  removeRolebinding: (ituserIndex: number, rolebindingIndex: number) =>
    store.update((itusers) => {
      const ituser = itusers[ituserIndex]
      return itusers.toSpliced(ituserIndex, 1, {
        ...ituser,
        rolebindings: ituser.rolebindings.toSpliced(rolebindingIndex, 1),
      })
    }),
}
