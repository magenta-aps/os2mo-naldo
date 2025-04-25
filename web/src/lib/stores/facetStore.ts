import { writable } from "svelte/store"

const facetStore = writable({ name: "", uuid: "" })

export { facetStore }
