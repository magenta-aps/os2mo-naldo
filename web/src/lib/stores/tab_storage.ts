import { browser } from "$app/environment"
import { writable } from "svelte/store"

function createTabStorage() {
  const initialValue = (browser && localStorage.getItem("currentTab")) || ""
  const { subscribe, set } = writable<string>(initialValue)

  function setTab(tab: string) {
    set(tab)
    if (browser) {
      localStorage.setItem("currentTab", tab)
    }
  }

  return {
    subscribe,
    setTab,
  }
}

export const tabStorage = createTabStorage()
