import { writable } from "svelte/store"

const defaultSidebarWidth = 314.95

export const sidebarWidth = writable(defaultSidebarWidth)
