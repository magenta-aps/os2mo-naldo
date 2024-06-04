import { writable, get } from "svelte/store"

const globalNavigation = writable("")

const updateGlobalNavigation = (uuid: string) => {
  const current = get(globalNavigation)
  if (current !== uuid) {
    globalNavigation.set(uuid)
  }
}

export { globalNavigation, updateGlobalNavigation }
