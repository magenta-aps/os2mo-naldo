import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"

export type Facet = {
  objects: {
    uuid: any
    user_key: string
    classes?: { name: string; uuid: any; user_key: string }[]
  }[]
}

// This should replace the `Facet`-type at some point
export type FacetValidities = {
  validities: {
    uuid: any
    user_key: string
    classes?: { name: string; uuid: any; user_key: string }[]
  }[]
}

export const getClassesByFacetUserKey = (
  facets: FacetValidities[],
  user_key: string
) => {
  const foundFacet = facets.find((facet) => facet.validities[0].user_key === user_key)
  if (!foundFacet) {
    throw new Error("user_key did not match any of the given facets")
  }
  return foundFacet.validities[0].classes?.sort((a, b) => (a.name > b.name ? 1 : -1))
}

// `get(_)` for translations since `$_` is a store and doesn't work in .ts files
export const sortFacets = (facets: FacetValidities[]) => {
  return facets
    .map((e) => ({
      name: capital(get(_)("facets.name." + e.validities[0].user_key)),
      uuid: e.validities[0].uuid,
    }))
    .sort((a, b) => (a.name > b.name ? 1 : -1))
}

type Class = {
  validities: {
    uuid: any
    user_key: string
    name?: string
  }[]
}

export const getClassUuidByUserKey = (classes: Class[], user_key: string) => {
  // Maybe this isn't the best way? The problem is we don't know the order in which the classes come in, so I guess we need something like this?
  const foundClass = classes.find((cls) => cls.validities[0].user_key === user_key)
  if (!foundClass) {
    throw new Error("user_key did not match any of the given classes")
  }
  return foundClass.validities[0].uuid
}

export const getClassByUserKey = (classes: Class[], user_key: string) => {
  const foundClass = classes.find((cls) => cls.validities[0].user_key === user_key)
  if (!foundClass) {
    throw new Error("user_key did not match any of the given classes")
  }
  return foundClass.validities[0]
}
