import { beforeEach, describe, expect, it, vi } from "vitest"

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2030, 0, 1, 0, 0, 0, 0))
    // The time of the last call is module state.
    vi.resetModules()
  })

  it("calls through on the first call", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async (x: number) => x * 2)
    await expect(debounce(fn, 21)).resolves.toBe(42)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(21)
  })

  it("drops a call within a second of the last", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async () => "ok")
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    // A dropped call's promise never settles, so it cannot be awaited.
    void debounce(fn)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("calls through again after a second", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async () => "ok")
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1001)
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
