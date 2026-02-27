import { writable } from "svelte/store"

const facetStore = writable({ name: "", uuid: "", user_key: "" })

export { facetStore }
