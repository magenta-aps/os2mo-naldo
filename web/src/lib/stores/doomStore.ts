import { writable } from "svelte/store"

const doomStore = writable({ enable: false })

export { doomStore }
