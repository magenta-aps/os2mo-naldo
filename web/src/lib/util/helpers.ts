import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { get } from "svelte/store"

export const tenseToValidity = (
  tense: Tense,
  date: string
): { fromDate: string | null; toDate: string | null } | {} => {
  switch (tense) {
    case "past":
      return { fromDate: null, toDate: date }
    case "present":
      return {}
    case "future":
      return { fromDate: date, toDate: null }
  }
}

export const tenseFilter = (
  obj: { validity: Validity | OpenValidity },
  tense: Tense
) => {
  const globalDate = get(date)
  switch (tense) {
    case "past":
      return globalDate > obj.validity.to?.split("T")[0]
    case "present":
      return true
    case "future":
      return globalDate < obj.validity.from.split("T")[0]
  }
}

type ITUserITSystemName = {
  uuid: string
  user_key: string
  itsystem: { name: string }
}

export const getITUserITSystemName = (itusers: ITUserITSystemName[]) => {
  return itusers.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem.name}, ${ituser.user_key}`,
  }))
}

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
type EngagementTitleAndUuid = {
  uuid: string
  job_function: { name: string }
  org_unit: { name: string }[]
}

export const getEngagementTitlesAndUuid = (engagements: EngagementTitleAndUuid[]) => {
  return engagements.map((engagement) => ({
    uuid: engagement.uuid,
    name: `${engagement.job_function.name}, ${engagement.org_unit[0].name}`,
  }))
}

type ITSystem = {
  objects: {
    uuid: string
    name: string
  }[]
}

export const getITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems.map((itsystem) => ({
    uuid: itsystem.objects[0].uuid,
    name: itsystem.objects[0].name,
  }))
  return ITSystems.sort((a, b) => (a.name > b.name ? 1 : -1))
}
