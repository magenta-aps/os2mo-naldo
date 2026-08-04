import { get } from "svelte/store"
import { date } from "$lib/stores/date"
import { createMultiStepStore } from "$lib/stores/createStepStore"

export type EngagementInfo = {
  fromDate: string
  toDate: string
  orgUnit: { uuid: string; name: string } | undefined
  userkey: string
  jobFunction: { uuid: string; name: string; userkey: string }
  engagementType: { uuid: string; name: string; userkey: string }
  primary: { uuid: string; name: string; userkey: string }
  validated?: boolean
}

export const createDefaultEngagement = (): EngagementInfo => ({
  fromDate: get(date),
  toDate: "",
  orgUnit: undefined,
  userkey: "",
  jobFunction: { uuid: "", name: "", userkey: "" },
  engagementType: { uuid: "", name: "", userkey: "" },
  primary: { uuid: "", name: "", userkey: "" },
  validated: undefined,
})

export const validateEngagement = (engagement: EngagementInfo): boolean => {
  return (
    !!engagement.fromDate &&
    !!engagement.orgUnit?.uuid &&
    !!engagement.jobFunction?.uuid &&
    !!engagement.engagementType?.uuid
  )
}

const store = createMultiStepStore(createDefaultEngagement, validateEngagement)

export const engagementInfo = {
  ...store,
  addEngagement: store.addItem,
  removeEngagement: store.removeItem,
}
