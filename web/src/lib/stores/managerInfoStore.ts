import { get } from "svelte/store"
import { date } from "$lib/stores/date"
import { createMultiStepStore } from "$lib/stores/createStepStore"

export type ManagerInfo = {
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  managerType: { uuid: string; name: string; userkey: string }
  managerLevel: { uuid: string; name: string; userkey: string }
  responsibilities: { uuid: string; name: string; userkey: string }[]
  validated?: boolean
}

export const createDefaultManager = (): ManagerInfo => ({
  fromDate: get(date),
  toDate: "",
  orgUnit: undefined,
  managerType: { uuid: "", name: "", userkey: "" },
  managerLevel: { uuid: "", name: "", userkey: "" },
  responsibilities: [],
  validated: undefined,
})

export const validateManager = (manager: ManagerInfo): boolean => {
  return (
    !!manager.fromDate &&
    !!manager.orgUnit?.uuid &&
    !!manager.managerType?.uuid &&
    !!manager.managerLevel?.uuid &&
    !!manager.responsibilities?.length
  )
}

const store = createMultiStepStore(createDefaultManager, validateManager)

export const managerInfo = {
  ...store,
  addManager: store.addItem,
  removeManager: store.removeItem,
}
