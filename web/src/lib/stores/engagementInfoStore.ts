import { writable, get } from "svelte/store"
import { date } from "$lib/stores/date"

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

export const engagementInfo = (() => {
  const defaultValue: EngagementInfo[] = [createDefaultEngagement()]

  const { subscribe, update, set } = writable<EngagementInfo[]>(defaultValue)

  return {
    subscribe,
    set,
    update,
    reset: () => {
      set([createDefaultEngagement()])
    },
    addEngagement: () =>
      update((engagements) => [...engagements, createDefaultEngagement()]),
    removeEngagement: (engagementIndex: number) =>
      update((engagements) => engagements.toSpliced(engagementIndex, 1)),
    validateForm: () => {
      let isValid = false

      update((engagements) => {
        const updated = engagements.map((engagement) => {
          return { ...engagement, validated: validateEngagement(engagement) }
        })
        isValid = updated.every((engagement) => engagement.validated)

        return updated
      })
      return isValid
    },
  }
})()
