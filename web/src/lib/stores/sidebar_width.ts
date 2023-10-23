import { browser } from "$app/environment"
import { writable } from "svelte/store"

export const defaultSidebarWidth = 314.95 // Standard width of the drawer (also minimum width for sidebar-resizing)

export const sidebarWidth = writable(
  (browser && localStorage.sidebarWidth) || defaultSidebarWidth
)

if (browser) {
  sidebarWidth.subscribe((width) => (localStorage.sidebarWidth = width))
}
