import { writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"

// `_key` is a client-only identity for multi-instance items: the wizard keys
// its tab blocks by it, so removing a tab destroys that tab's component
// instead of shifting the remaining items into stale component instances.
// It never leaves the client (the payload mapper builds inputs field by field).
export type Validatable = { validated?: boolean; _key?: string }

// The userflow's per-step data stores share one lifecycle: seed with a
// default, stamp `validated` onto every item on submit, and reset when the
// flow restarts. These factories centralise that so the per-entity modules
// only provide their type, default and validation rule.

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
    // For callers that validate externally (the shared field groups) and
    // only need the flag stored for the Stepper/summary UI.
    setValidated: (validated: boolean) => update((item) => ({ ...item, validated })),
    // Demote-only re-stamp: an already-approved item that no longer passes
    // loses its flag, but nothing is promoted — the store rules are weaker
    // than the field groups' validators, and skipped items must stay skipped.
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
  const createItem = (): T => ({ ...createDefault(), _key: uuidv4() })
  const { subscribe, update, set } = writable<T[]>([createItem()])

  return {
    subscribe,
    set,
    update,
    reset: () => set([createItem()]),
    addItem: () => update((items) => [...items, createItem()]),
    removeItem: (index: number) => update((items) => items.toSpliced(index, 1)),
    // For callers that validate externally (the shared field groups) and
    // only need the per-item flags stored for the tab/Stepper/summary UI.
    setValidated: (flags: boolean[]) =>
      update((items) =>
        items.map((item, index) => ({
          ...item,
          validated: flags[index] ?? item.validated,
        }))
      ),
    // Demote-only re-stamp; see the single-store variant for the rationale.
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
