import { browser } from "$app/environment"
import { writable } from "svelte/store"

export const minDrawerWidth = 240 // Minimum width the drawer can shrink to
export const defaultDrawerWidth = 314.95 // Default size of the drawer
export const maxDrawerWidth = 800

export const drawerWidth = writable(
  browser && localStorage.drawerWidth
    ? Math.max(Number(localStorage.drawerWidth), minDrawerWidth) // Ensure it's not smaller than minDrawerWidth
    : defaultDrawerWidth
)

if (browser) {
  drawerWidth.subscribe((width) => {
    // Adjust the width based on the minDrawerWidth
    const adjustedDrawerWidth = Math.max(
      minDrawerWidth,
      Math.min(width, maxDrawerWidth)
    ) // Prevent going below minDrawerWidth

    if (width !== adjustedDrawerWidth) {
      drawerWidth.set(adjustedDrawerWidth)
    }

    localStorage.drawerWidth = adjustedDrawerWidth
  })
}
