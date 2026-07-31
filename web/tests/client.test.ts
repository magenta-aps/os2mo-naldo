import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// `$lib/env` reads the environment on import, so the base url has to be set first
process.env.PUBLIC_BASE_URL = "http://mo.example"
const { graphQLClient } = await import("$lib/http/client")

const QUERY = "query Version { version { mo_version } }"

const respondWith = (body: unknown, status = 200) =>
  vi.fn(async () => ({
    ok: status < 400,
    status,
    headers: new Headers({ "Content-Type": "application/json" }),
    text: async () => JSON.stringify(body),
  }))

const sentRequestId = (fetchMock: { mock: { calls: any[][] } }) =>
  new Headers(fetchMock.mock.calls[0][1].headers).get("x-request-id")

describe("graphQLClient", () => {
  beforeEach(() => {
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(new AbortController().signal)
    vi.stubGlobal("fetch", respondWith({ data: { version: { mo_version: "1" } } }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("sends an X-Request-ID header, which MO binds to its logs", async () => {
    await graphQLClient().request(QUERY)
    expect(sentRequestId(fetch as any)).toBeTruthy()
  })

  it("sends a new request id per request", async () => {
    await graphQLClient().request(QUERY)
    const first = sentRequestId(fetch as any)
    vi.stubGlobal("fetch", respondWith({ data: { version: { mo_version: "1" } } }))
    await graphQLClient().request(QUERY)
    expect(sentRequestId(fetch as any)).not.toBe(first)
  })

  it("tags GraphQL errors with the request id that was sent", async () => {
    vi.stubGlobal("fetch", respondWith({ errors: [{ message: "nope" }] }))
    const err: any = await graphQLClient()
      .request(QUERY)
      .catch((err) => err)
    expect(err.requestId).toBe(sentRequestId(fetch as any))
  })

  it("tags HTTP errors with the request id that was sent", async () => {
    vi.stubGlobal("fetch", respondWith({ detail: "Not authenticated" }, 401))
    const err: any = await graphQLClient()
      .request(QUERY)
      .catch((err) => err)
    expect(err.requestId).toBe(sentRequestId(fetch as any))
  })

  it("tags network failures, which never reach the responseMiddleware", async () => {
    const failingFetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch")
    })
    vi.stubGlobal("fetch", failingFetch)
    const err: any = await graphQLClient()
      .request(QUERY)
      .catch((err) => err)
    expect(err.requestId).toBe(sentRequestId(failingFetch as any))
  })
})
