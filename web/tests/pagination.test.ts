import { describe, it, expect } from "vitest"
import { isRetryableError } from "$lib/http/pagination"

// Pins the retry predicate extracted from paginateQuery. These three
// classes of failure were added to the retry list in #68989 after
// network blips caused insights exports to abort mid-pagination.

describe("isRetryableError", () => {
  it("retries TypeError (network failure from fetch)", () => {
    expect(isRetryableError(new TypeError("Failed to fetch"))).toBe(true)
  })

  it("retries TimeoutError (from AbortSignal.timeout)", () => {
    const err = new Error("The operation was aborted")
    err.name = "TimeoutError"
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries when GraphQL response carries a 'Signature has expired' error", () => {
    const err = {
      response: {
        errors: [{ message: "Signature has expired" }],
      },
    }
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries regardless of the expired-signature message casing", () => {
    const err = { response: { errors: [{ message: "SIGNATURE HAS EXPIRED" }] } }
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries when only the top-level error.message contains the expired phrase", () => {
    // Not all clients wrap GraphQL errors the same way — the top-level
    // message path is the fallback.
    expect(isRetryableError(new Error("signature has expired"))).toBe(true)
  })

  it("does NOT retry generic runtime errors", () => {
    expect(isRetryableError(new Error("something else failed"))).toBe(false)
  })

  it("does NOT retry GraphQL validation errors", () => {
    const err = {
      response: { errors: [{ message: "Field 'foo' is not defined" }] },
    }
    expect(isRetryableError(err)).toBe(false)
  })

  it("handles null / undefined / missing .message gracefully", () => {
    expect(isRetryableError(null)).toBe(false)
    expect(isRetryableError(undefined)).toBe(false)
    expect(isRetryableError({})).toBe(false)
  })
})
