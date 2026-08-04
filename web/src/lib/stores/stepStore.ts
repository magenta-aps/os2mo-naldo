import { STEP_COUNT } from "$lib/userflow/stepIds"
import { writable } from "svelte/store"

// 1-based index into the userflow's step registry, clamped to its length.
const createStepStore = () => {
  const { subscribe, update, set } = writable<number>(1)

  const updateStep = (action: "inc" | "dec" | number) =>
    update((step) =>
      action === "inc"
        ? Math.min(step + 1, STEP_COUNT)
        : action === "dec"
        ? Math.max(step - 1, 1)
        : Math.min(Math.max(action, 1), STEP_COUNT)
    )

  return {
    subscribe,
    updateStep,
    reset: () => set(1),
  }
}

export const step = createStepStore()
