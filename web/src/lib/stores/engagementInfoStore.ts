import { browser } from "$app/environment"
import { writable } from "svelte/store"

type EngagementInfo = {
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  userkey: string
  jobFunction: { uuid: string; name: string; userkey: string }
  engagementType: { uuid: string; name: string; userkey: string }
  primary: { uuid: string; name: string; userkey: string }
  validated: boolean
}

const defaultValue: EngagementInfo = {
  fromDate: "",
  toDate: "",
  orgUnit: undefined,
  userkey: "",
  jobFunction: { uuid: "", name: "", userkey: "" },
  engagementType: { uuid: "", name: "", userkey: "" },
  primary: { uuid: "", name: "", userkey: "" },
  validated: false,
}

const createEngagementInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedEngagementInfo = localStorage.getItem("engagement-info")
    initialValue = storedEngagementInfo
      ? JSON.parse(storedEngagementInfo)
      : defaultValue
  }

  const { subscribe, update, set } = writable<EngagementInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("engagement-info")
    set(defaultValue)
  }

  const isValid = (valid: boolean) => {
    update((engagementStore) => {
      engagementStore.validated = valid
      return engagementStore
    })
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("engagement-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
    isValid,
  }
}

export const engagementInfo = createEngagementInfoStore()
