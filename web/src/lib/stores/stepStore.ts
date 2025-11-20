import { browser } from "$app/environment"
import { writable } from "svelte/store"

const createStepStore = () => {
  let initialStep = 1

  const { subscribe, update, set } = writable<number>(initialStep)

  const updateStep = (action: "inc" | "dec" | "res" | number) =>
    update((step) => {
      const newStep =
        action === "inc" && step < 6
          ? step + 1
          : action === "dec" && step > 1
          ? step - 1
          : typeof action === "number"
          ? (step = action)
          : 1
      return newStep
    })

  return {
    subscribe,
    updateStep,
  }
}

export const step = createStepStore()
