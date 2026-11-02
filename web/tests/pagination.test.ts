import { isRetryableError } from "$lib/http/pagination"
import { describe, expect, it } from "vitest"

describe("isRetryableError", () => {
  it("retries TypeError (network failure from fetch)", () => {
    expect(isRetryableError(new TypeError("Failed to fetch"))).toBe(true)
  })

  it("retries TimeoutError (from AbortSignal.timeout)", () => {
    const err = new Error("The operation was aborted")
    err.name = "TimeoutError"
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries an expired signature in the GraphQL errors", () => {
    const err = {
      response: {
        errors: [{ message: "Signature has expired" }],
      },
    }
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries an expired signature in any casing", () => {
    const err = { response: { errors: [{ message: "SIGNATURE HAS EXPIRED" }] } }
    expect(isRetryableError(err)).toBe(true)
  })

  it("retries an expired signature in the error's own message", () => {
    expect(isRetryableError(new Error("signature has expired"))).toBe(true)
  })

  it("does not retry other errors", () => {
    expect(isRetryableError(new Error("something else failed"))).toBe(false)
  })

  it("does not retry other GraphQL errors", () => {
    const err = {
      response: { errors: [{ message: "Field 'foo' is not defined" }] },
    }
    expect(isRetryableError(err)).toBe(false)
  })

  it("does not retry a missing error", () => {
    expect(isRetryableError(null)).toBe(false)
    expect(isRetryableError(undefined)).toBe(false)
    expect(isRetryableError({})).toBe(false)
  })
})
