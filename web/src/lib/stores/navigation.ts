import { writable, get } from "svelte/store"

const globalNavigation = writable("")

const updateGlobalNavigation = (uuid: string | null | undefined) => {
  const current = get(globalNavigation)
  if (uuid && current !== uuid) {
    globalNavigation.set(uuid)
  }
}

export { globalNavigation, updateGlobalNavigation }
