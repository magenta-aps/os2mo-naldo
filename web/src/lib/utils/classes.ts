import { _ } from "svelte-i18n"
import { capital } from "$lib/utils/helpers"
import { get } from "svelte/store"

// This should replace the `Facet`-type at some point
export type FacetValidities = {
  validities: {
    uuid: any
    user_key: string
    classes_responses?: {
      objects: {
        uuid: any
        current?: { name: string; user_key: string; scope?: string | null } | null
      }[]
    }
  }[]
}

export type Class = {
  validities: {
    uuid: any
    user_key: string
    name?: string
  }[]
}

export const filterClassesByFacetUserKey = (
  facets: FacetValidities[],
  user_key: string
) => {
  const foundFacet = facets.find((facet) => facet.validities[0].user_key === user_key)
  if (!foundFacet) {
    throw new Error("user_key did not match any of the given facets")
  }
  return foundFacet.validities[0].classes_responses?.objects
    ?.map((c) => ({
      name: c.current?.name ?? "",
      uuid: c.uuid,
      user_key: c.current?.user_key ?? "",
      scope: c.current?.scope,
    }))
    ?.sort((a, b) => (a.name > b.name ? 1 : -1))
}

export const filterClassUuidByUserKey = (classes: Class[], user_key: string) => {
  // Maybe this isn't the best way? The problem is we don't know the order in which the classes come in, so I guess we need something like this?
  const foundClass = classes.find((cls) => cls.validities[0].user_key === user_key)
  if (!foundClass) {
    throw new Error("user_key did not match any of the given classes")
  }
  return foundClass.validities[0].uuid
}

export const filterClassByUserKey = (classes: Class[], user_key: string) => {
  const foundClass = classes.find((cls) => cls.validities[0].user_key === user_key)
  if (!foundClass) {
    throw new Error("user_key did not match any of the given classes")
  }
  return foundClass.validities[0]
}
