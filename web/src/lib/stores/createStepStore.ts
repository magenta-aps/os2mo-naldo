import { writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"

export type Validatable = { validated?: boolean }

// Client-only identity the wizard keys its tabs and per-tab component refs by,
// so removing a tab destroys that tab's component rather than shifting the
// remaining items into stale instances. Required, not optional: the keying is
// only sound if every item has one.
export type Keyed = { _key: string }

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
    // For callers that validate externally (the shared field groups).
    setValidated: (validated: boolean) => update((item) => ({ ...item, validated })),
    // Demote-only: the store rules are weaker than the field groups'
    // validators, and skipped items must stay skipped.
    revalidate: () =>
      update((item) =>
        item.validated === true && !validate(item)
          ? { ...item, validated: false }
          : item
      ),
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
  const createItem = (): T & Keyed => ({ ...createDefault(), _key: uuidv4() })
  const { subscribe, update, set } = writable<(T & Keyed)[]>([createItem()])

  return {
    subscribe,
    set,
    update,
    reset: () => set([createItem()]),
    addItem: () => update((items) => [...items, createItem()]),
    removeItem: (index: number) =>
      update((items) => items.filter((_, i) => i !== index)),
    // For callers that validate externally (the shared field groups).
    setValidated: (flags: boolean[]) =>
      update((items) =>
        items.map((item, index) => ({
          ...item,
          validated: flags[index] ?? item.validated,
        }))
      ),
    // Demote-only; see the single-store variant.
    revalidate: () =>
      update((items) =>
        items.map((item) =>
          item.validated === true && !validate(item)
            ? { ...item, validated: false }
            : item
        )
      ),
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
