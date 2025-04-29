import { browser } from "$app/environment"
import { writable } from "svelte/store"

export const defaultDrawerWidth = 314.95 // Standard width of the drawer (also minimum width for sidebar-resizing)

export const drawerWidth = writable(
  browser && localStorage.drawerWidth
    ? Math.max(Number(localStorage.drawerWidth), defaultDrawerWidth)
    : defaultDrawerWidth
)

if (browser) {
  drawerWidth.subscribe((width) => {
    if (width < defaultDrawerWidth) {
      drawerWidth.set(defaultDrawerWidth)
    } else {
      localStorage.drawerWidth = width
    }
  })
}
