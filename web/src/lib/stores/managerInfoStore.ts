import { browser } from "$app/environment"
import { writable, get } from "svelte/store"
import { date } from "$lib/stores/date"

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

export const managerInfo = (() => {
  const defaultValue: ManagerInfo[] = [createDefaultManager()]

  let initialValue = defaultValue

  if (browser) {
    const stored = localStorage.getItem("manager-info")
    try {
      const parsed = stored ? JSON.parse(stored) : null
      initialValue = Array.isArray(parsed) ? parsed : defaultValue
    } catch {
      initialValue = defaultValue
    }
  }

  const { subscribe, update, set } = writable<ManagerInfo[]>(initialValue)

  subscribe((value) => {
    if (browser) localStorage.setItem("manager-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    update,
    reset: () => {
      if (browser) localStorage.removeItem("manager-info")
      set([createDefaultManager()])
    },
    addManager: () => update((managers) => [...managers, createDefaultManager()]),
    removeManager: (managerIndex: number) =>
      update((managers) => managers.toSpliced(managerIndex, 1)),
    validateForm: () => {
      let isValid = false

      update((managers) => {
        const updated = managers.map((manager) => {
          return { ...manager, validated: validateManager(manager) }
        })
        isValid = updated.every((manager) => manager.validated)

        return updated
      })
      return isValid
    },
  }
})()
