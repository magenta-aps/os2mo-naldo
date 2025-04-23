import { browser } from "$app/environment"
import { writable } from "svelte/store"

type RolebindingInfo = {
  fromDate: string
  toDate: string
  role: { uuid: string; name: string; user_key: string }
  validated: boolean
}

const defaultValue: RolebindingInfo[] = [
  {
    fromDate: "",
    toDate: "",
    role: { uuid: "", name: "", user_key: "" },
    validated: false,
  },
]

const createRolebindingInfoStore = () => {
  let initialValue: RolebindingInfo[] = defaultValue

  if (browser) {
    const stored = localStorage.getItem("rolebinding-info")
    initialValue = stored ? JSON.parse(stored) : defaultValue
  }

  const { subscribe, update, set } = writable<RolebindingInfo[]>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("rolebinding-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((rolebindingStore) => {
      rolebindingStore.validated = valid
      return rolebindingStore
    })
  }

  const validateAll = () => {
    let allValid = true
    update((infos) =>
      infos.map((info) => {
        const isValid = !!info.role?.uuid && !!info.fromDate
        if (!isValid) allValid = false
        return { ...info, validated: isValid }
      })
    )
    return allValid
  }

  const addRolebinding = (fromDate: string, toDate: string) => {
    update((items) => [
      ...items,
      {
        fromDate: fromDate,
        toDate: toDate || "",
        role: { uuid: "", name: "", user_key: "" },
        validated: false,
      },
    ])
  }

  const removeRolebinding = (index: number) => {
    update((items) => items.filter((_, i) => i !== index))
  }

  const updateRolebindingDates = (newDate: string, dateType: "fromDate" | "toDate") => {
    update((rolebindings) =>
      rolebindings.map((rb) => ({
        ...rb,
        [dateType]: newDate,
      }))
    )
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("rolebinding-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
    validateAll,
    addRolebinding,
    removeRolebinding,
    updateRolebindingDates,
  }
}

export const rolebindingInfo = createRolebindingInfoStore()
