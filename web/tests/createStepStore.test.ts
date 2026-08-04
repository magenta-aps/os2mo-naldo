import {
  createMultiStepStore,
  createSingleStepStore,
  type Validatable,
} from "$lib/stores/createStepStore"
import { get } from "svelte/store"
import { describe, expect, it } from "vitest"

type Item = { name: string } & Validatable

const createDefault = (): Item => ({ name: "", validated: undefined })
const validate = (item: Item) => item.name.length > 0

describe("createSingleStepStore", () => {
  it("seeds with the default", () => {
    const store = createSingleStepStore(createDefault, validate)
    expect(get(store)).toEqual({ name: "", validated: undefined })
  })

  it("validateForm stamps validated and returns the result", () => {
    const store = createSingleStepStore(createDefault, validate)
    expect(store.validateForm()).toBe(false)
    expect(get(store).validated).toBe(false)

    store.update((item) => ({ ...item, name: "Alice" }))
    expect(store.validateForm()).toBe(true)
    expect(get(store).validated).toBe(true)
  })

  it("reset restores a fresh default", () => {
    const store = createSingleStepStore(createDefault, validate)
    store.set({ name: "Alice", validated: true })
    store.reset()
    expect(get(store)).toEqual({ name: "", validated: undefined })
  })
})

describe("createMultiStepStore", () => {
  it("seeds with one default item carrying a client identity key", () => {
    const store = createMultiStepStore(createDefault, validate)
    const items = get(store)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ name: "", validated: undefined })
    expect(items[0]._key).toBeTruthy()
  })

  it("addItem appends a default; removeItem removes by index", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    store.addItem()
    expect(get(store)).toHaveLength(3)

    store.update((items) =>
      items.map((item, index) => ({ ...item, name: `item-${index}` }))
    )
    store.removeItem(1)
    expect(get(store).map((item) => item.name)).toEqual(["item-0", "item-2"])
  })

  it("validateForm stamps every item and requires all to pass", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    store.update((items) => [{ ...items[0], name: "Alice" }, items[1]])

    expect(store.validateForm()).toBe(false)
    expect(get(store).map((item) => item.validated)).toEqual([true, false])

    store.update((items) => items.map((item) => ({ ...item, name: "filled" })))
    expect(store.validateForm()).toBe(true)
    expect(get(store).every((item) => item.validated)).toBe(true)
  })

  it("reset restores a single fresh default", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    store.validateForm()
    store.reset()
    const items = get(store)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ name: "", validated: undefined })
  })

  it("revalidate only demotes: true -> false on failure, never promotes", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    store.addItem()
    store.set([
      { name: "", validated: true, _key: "a" }, // stale approval, now invalid -> demoted
      { name: "ok", validated: undefined, _key: "b" }, // skipped, valid data -> untouched
      { name: "", validated: false, _key: "c" }, // rejected -> untouched
    ])
    store.revalidate()
    expect(get(store).map((item) => item.validated)).toEqual([false, undefined, false])
  })

  // What the wizard actually calls: EntityStep validates each tab through its
  // field group and stamps the results here.
  it("setValidated stamps flags positionally and keeps unflagged items", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    store.addItem()
    store.setValidated([true, false])
    expect(get(store).map((item) => item.validated)).toEqual([true, false, undefined])

    store.setValidated([false])
    expect(get(store).map((item) => item.validated)).toEqual([false, false, undefined])
  })

  it("removeItem drops the item's key with it", () => {
    const store = createMultiStepStore(createDefault, validate)
    store.addItem()
    const keys = get(store).map((item) => item._key)
    store.removeItem(0)
    expect(get(store).map((item) => item._key)).toEqual([keys[1]])
  })
})
