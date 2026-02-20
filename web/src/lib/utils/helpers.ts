import { env } from "$env/dynamic/public"
import { date } from "$lib/stores/date"
import { keycloak } from "$lib/auth/keycloak"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"

export type ITUserITSystemName = {
  uuid: string
  user_key: string
  itsystem: {
    name: string
    uuid?: string
  }
}

export const formatITUserITSystemName = (itusers: ITUserITSystemName[] | undefined) => {
  return itusers?.map((ituser) => ({
    uuid: ituser.uuid,
    name: `${ituser.itsystem.name}, ${ituser.user_key}`,
    itsystem: { uuid: ituser.itsystem.uuid },
  }))
}

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
export type EngagementTitleAndUuid = {
  uuid: string
  job_function: { name: string }
  org_unit: { name: string }[]
}

export const formatEngagementTitlesAndUuid = (
  engagements: EngagementTitleAndUuid[]
) => {
  return engagements.map((engagement) => ({
    uuid: engagement.uuid,
    name: `${engagement.job_function.name}, ${engagement.org_unit[0].name}`,
  }))
}

export type KleNumberTitleAndUuid = {
  uuid: string
  name: string
  user_key: string
}

export const formatKleNumberTitleAndUuid = (kles: KleNumberTitleAndUuid[]) => {
  const KleNumbers = kles.map((kle) => ({
    uuid: kle.uuid,
    name: `${kle.user_key} - ${kle.name}`,
  }))
  return KleNumbers.sort((a, b) => (a.name > b.name ? 1 : -1))
}

export type ITSystem = {
  current?: {
    uuid: string
    name: string
    user_key?: string
  } | null
}

export const formatITSystemNames = (itsystems: ITSystem[]) => {
  const ITSystems = itsystems
    .filter((itsystem) => itsystem.current && itsystem.current !== null)
    .map((itsystem) => ({
      uuid: itsystem.current!.uuid,
      name: itsystem.current!.name,
      user_key: itsystem.current?.user_key,
    }))
  return ITSystems.sort((a, b) => (a.name > b.name ? 1 : -1))
}

// Type used for Multi-select
export type UnpackedClass = {
  name: string
  uuid: string
  user_key: string
}[]

export const cprLookup = async (cpr: string) => {
  const res = await fetch(`${env.PUBLIC_BASE_URL}/service/e/cpr_lookup/?q=${cpr}`, {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
  // FIXME: Maybe return empty array, if call fails?
  return [await res.json()]
}

export const isUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export const checkSDIdentifier = (name: string, user_key: string) => {
  if (
    env.PUBLIC_SHOW_SD_CODE_IN_TREES !== "true" ||
    name === user_key ||
    user_key === "-" ||
    isUUID(user_key)
  ) {
    return name
  }
  return `${name} (${user_key})`
}

export const capital = (str: string) => {
  return str.replace(/(^|\s)\S/, (l) => l.toLocaleUpperCase())
}

export const upperCase = (str: string) => {
  return str.toUpperCase()
}
