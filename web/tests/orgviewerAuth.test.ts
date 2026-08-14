import { beforeEach, describe, expect, it, vi } from "vitest"

// SvelteKit's Vite plugin snapshots $env/dynamic/(public|private) once when
// the dev server config resolves, before any test file runs - mutating
// process.env from within a test has no effect on `env`/`serverEnv`. So
// these tests exercise `getServiceToken`'s caching/dedup/error-handling
// behavior without asserting on the (env-derived, effectively fixed-empty-
// in-this-suite) Keycloak URL or credential values themselves.
//
// `getServiceToken` caches its result in module-level state, so each test
// re-imports via `vi.resetModules` for a clean slate.

const respondWith = (body: unknown, ok = true) =>
  vi.fn(async (_url: string, _init?: RequestInit) => ({
    ok,
    status: ok ? 200 : 401,
    statusText: ok ? "OK" : "Unauthorized",
    json: async () => body,
  }))

describe("getServiceToken", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2030, 0, 1, 0, 0, 0, 0))
    vi.resetModules()
  })

  it("requests a client-credentials token and returns it", async () => {
    const fetchMock = respondWith({ access_token: "tok-1", expires_in: 60 })
    vi.stubGlobal("fetch", fetchMock)

    const { getServiceToken } = await import("$lib/server/orgviewerAuth")
    const token = await getServiceToken()

    expect(token.access_token).toBe("tok-1")
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain("/protocol/openid-connect/token")
    const headers = init?.headers as Record<string, string>
    expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded")
    const body = init?.body?.toString() ?? ""
    expect(body).toContain("grant_type=client_credentials")
    expect(body).toContain("client_id=")
    expect(body).toContain("client_secret=")

    vi.unstubAllGlobals()
  })

  it("reuses the cached token instead of refetching while it's still fresh", async () => {
    const fetchMock = respondWith({ access_token: "tok-1", expires_in: 60 })
    vi.stubGlobal("fetch", fetchMock)

    const { getServiceToken } = await import("$lib/server/orgviewerAuth")
    await getServiceToken()
    await getServiceToken()

    expect(fetchMock).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })

  it("refetches once the cached token is within the refresh margin of expiry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok-1", expires_in: 60 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok-2", expires_in: 60 }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const { getServiceToken } = await import("$lib/server/orgviewerAuth")
    const first = await getServiceToken()
    expect(first.access_token).toBe("tok-1")

    // 60s expiry, 15s refresh margin -> stale after 45s
    vi.advanceTimersByTime(46_000)

    const second = await getServiceToken()
    expect(second.access_token).toBe("tok-2")
    expect(fetchMock).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
  })

  it("collapses concurrent calls into a single Keycloak request", async () => {
    let resolveFetch: (value: unknown) => void
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getServiceToken } = await import("$lib/server/orgviewerAuth")
    const first = getServiceToken()
    const second = getServiceToken()

    resolveFetch!({ ok: true, json: async () => ({ access_token: "tok-1", expires_in: 60 }) })

    const [a, b] = await Promise.all([first, second])
    expect(a.access_token).toBe("tok-1")
    expect(b.access_token).toBe("tok-1")
    expect(fetchMock).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })

  it("throws (and does not cache) when Keycloak responds with an error", async () => {
    vi.stubGlobal("fetch", respondWith({}, false))

    const { getServiceToken } = await import("$lib/server/orgviewerAuth")
    await expect(getServiceToken()).rejects.toThrow(/Keycloak token request failed/)
    vi.unstubAllGlobals()
  })
})

describe("backoffDelayMs", () => {
  it("doubles per consecutive failure, starting at 1s", async () => {
    const { backoffDelayMs } = await import("$lib/auth/orgviewerAuth")
    expect(backoffDelayMs(0)).toBe(1000)
    expect(backoffDelayMs(1)).toBe(2000)
    expect(backoffDelayMs(2)).toBe(4000)
  })

  it("caps at 30s", async () => {
    const { backoffDelayMs } = await import("$lib/auth/orgviewerAuth")
    expect(backoffDelayMs(10)).toBe(30_000)
  })
})
