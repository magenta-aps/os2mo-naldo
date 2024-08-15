import { writable } from "svelte/store"

const facetStore = writable({ name: "", uuid: "" })

const updateFacetStore = (facet: { name: string; uuid: string; user_key?: string }) => {
  facetStore.set(facet)
}

export { facetStore, updateFacetStore }
