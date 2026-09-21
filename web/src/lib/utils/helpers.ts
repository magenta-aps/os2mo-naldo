import { keycloak } from "$lib/auth/keycloak"
import { env } from "$lib/env"

export type ITUserITSystemName = {
  uuid: string
  user_key: string
  itsystem_response: {
    uuid: string
    current?: {
      name: string
    } | null
  }
}

export const formatITUserITSystemName = (ituser: ITUserITSystemName) => ({
  uuid: ituser.uuid,
  name: `${ituser.itsystem_response.current?.name ?? ituser.itsystem_response.uuid}, ${
    ituser.user_key
  }`,
  itsystem: { uuid: ituser.itsystem_response.uuid },
})

export const formatITUserITSystemNames = (itusers: ITUserITSystemName[] | undefined) =>
  itusers?.map(formatITUserITSystemName)

// Used to display both job_function-name and org-name on a single line, for example, in a dropdown select.
export type EngagementTitleAndUuid = {
  uuid: string
  job_function_response?: { current?: { name: string } | null }
  org_unit_response?: { current?: { name: string } | null }
  person_response?: { uuid: string; current?: { name: string } | null } | null
}

export const formatEngagementTitlesAndUuid = (
  engagements: EngagementTitleAndUuid[]
) => {
  return engagements.map((engagement) => ({
    uuid: engagement.uuid,
    // Either half can be absent when a unit or job function no longer resolves,
    // and Select drops an option with an empty name.
    name:
      [
        engagement.job_function_response?.current?.name,
        engagement.org_unit_response?.current?.name,
      ]
        .filter(Boolean)
        .join(", ") || engagement.uuid,
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

// MO fills an unset user-key with the object's own uuid.
export const isMeaningfulUserKey = (
  user_key: string | undefined,
  name?: string
): boolean => {
  if (!user_key) return false
  if (user_key === name) return false
  if (user_key === "-") return false
  if (isUUID(user_key)) return false
  return true
}

export const suffixUserKey = (name: string, user_key: string | undefined): string =>
  isMeaningfulUserKey(user_key, name) ? `${name} (${user_key})` : name

export const capital = (str: string) => {
  return str.replace(/(^|\s)\S/, (l) => l.toLocaleUpperCase())
}

export const upperCase = (str: string) => {
  return str.toUpperCase()
}
