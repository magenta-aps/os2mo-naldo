import { describe, it, expect, beforeEach, vi } from "vitest"

// `debounce` maintains a module-level `lastCalledAt` and only resolves when
// at least 1000ms have passed since the last call. When a call is rejected,
// the returned Promise is NEVER resolved (no `resolve` in the else branch).
//
// Because the gate is module-scoped, each test re-imports via `vi.resetModules`
// to get a fresh state.

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2030, 0, 1, 0, 0, 0, 0))
    vi.resetModules()
  })

  it("calls the wrapped function and resolves with its result on the first pass", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async (x: number) => x * 2)
    await expect(debounce(fn, 21)).resolves.toBe(42)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(21)
  })

  it("does NOT call the wrapped function a second time within 1000ms", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async () => "ok")
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    // Kick off a second call but don't await — the returned promise hangs
    // forever by design (no else-branch resolve). Asserting that `fn` wasn't
    // re-invoked is enough to pin behavior without waiting on a dead promise.
    void debounce(fn)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("resolves again once more than 1000ms have passed", async () => {
    const { debounce } = await import("$lib/utils/debounce")
    const fn = vi.fn(async () => "ok")
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1001)
    await debounce(fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
