import { browser } from "$app/environment"
import { writable } from "svelte/store"

type EngagementInfo = {
  person: string
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string }
  userkey: string
  jobFunction: { uuid: string; name: string; userkey: string }
  engagementType: { uuid: string; name: string; userkey: string }
  primary: string
}

const defaultValue: EngagementInfo = {
  person: "", // Somehow get employeeInfoStore.uuid
  fromDate: "",
  toDate: "",
  orgUnit: { uuid: "", name: "" },
  userkey: "",
  jobFunction: { uuid: "", name: "", userkey: "" },
  engagementType: { uuid: "", name: "", userkey: "" },
  primary: "",
}

const createEngagementInfoStore = () => {
  let initialValue = defaultValue

  if (browser) {
    const storedEngagementInfo = localStorage.getItem("engagement-info")
    initialValue = storedEngagementInfo
      ? JSON.parse(storedEngagementInfo)
      : defaultValue
  }

  const { subscribe, set } = writable<EngagementInfo>(initialValue)

  const reset = () => {
    if (browser) localStorage.removeItem("engagement-info")
    set(defaultValue)
  }

  subscribe((value) => {
    if (browser) localStorage.setItem("engagement-info", JSON.stringify(value))
  })

  return {
    subscribe,
    set,
    reset,
  }
}

export const engagementInfo = createEngagementInfoStore()
