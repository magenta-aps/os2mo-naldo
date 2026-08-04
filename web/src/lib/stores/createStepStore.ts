import { writable } from "svelte/store"

export type Validatable = { validated?: boolean }

export const createSingleStepStore = <T extends Validatable>(
  createDefault: () => T,
  validate: (item: T) => boolean
) => {
  const { subscribe, update, set } = writable<T>(createDefault())

  return {
    subscribe,
    set,
    update,
    reset: () => set(createDefault()),
    // Stamps `validated` and returns it, so callers can gate navigation.
    validateForm: (): boolean => {
      let isValid = false
      update((item) => {
        isValid = validate(item)
        return { ...item, validated: isValid }
      })
      return isValid
    },
  }
}

export const createMultiStepStore = <T extends Validatable>(
  createDefault: () => T,
  validate: (item: T) => boolean
) => {
  const { subscribe, update, set } = writable<T[]>([createDefault()])

  return {
    subscribe,
    set,
    update,
    reset: () => set([createDefault()]),
    addItem: () => update((items) => [...items, createDefault()]),
    removeItem: (index: number) => update((items) => items.toSpliced(index, 1)),
    // Stamps `validated` per item; true iff every item validates.
    validateForm: (): boolean => {
      let isValid = false
      update((items) => {
        const updated = items.map((item) => ({ ...item, validated: validate(item) }))
        isValid = updated.every((item) => item.validated)
        return updated
      })
      return isValid
    },
  }
}
