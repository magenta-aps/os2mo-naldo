import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { get } from "svelte/store"
import { warning } from "$lib/stores/alert"

describe("alert store dismissal", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    warning.clear()
    vi.useRealTimers()
  })

  it("clears the alert once its timeout passes", () => {
    warning.set({ message: "boom" })
    vi.advanceTimersByTime(4999)
    expect(get(warning).message).toBe("boom")

    vi.advanceTimersByTime(1)
    expect(get(warning).message).toBe("")
  })

  it("gives a superseding alert the full timeout", () => {
    warning.set({ message: "first" })
    vi.advanceTimersByTime(4000)
    warning.set({ message: "second" })

    vi.advanceTimersByTime(1000)
    expect(get(warning).message).toBe("second")

    vi.advanceTimersByTime(4000)
    expect(get(warning).message).toBe("")
  })

  it("cancels the pending dismissal when cleared", () => {
    warning.set({ message: "boom" })
    warning.clear()
    expect(get(warning).message).toBe("")

    vi.advanceTimersByTime(5000)
    warning.set({ message: "later" })
    vi.advanceTimersByTime(4999)
    expect(get(warning).message).toBe("later")
  })
})
