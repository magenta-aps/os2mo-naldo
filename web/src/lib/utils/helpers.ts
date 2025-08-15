import { env } from "$env/dynamic/public"
import type { OpenValidity, Validity } from "$lib/graphql/types"
import { date } from "$lib/stores/date"
import { keycloak } from "$lib/util/keycloak"
import { _, locale } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"

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
