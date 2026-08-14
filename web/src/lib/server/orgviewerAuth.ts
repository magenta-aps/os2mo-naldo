import { env } from "$lib/env"
import { serverEnv } from "$lib/server/env"

type Token = {
  access_token: string
  expiresAt: number
}

let cached: Token | null = null
let inflight: Promise<Token> | null = null

const REFRESH_MARGIN_MS = 15_000

const fetchToken = async (): Promise<Token> => {
  const url = `${env.PUBLIC_KEYCLOAK_URL}/realms/${env.PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: serverEnv.ORGVIEWER_KEYCLOAK_CLIENT_ID,
      client_secret: serverEnv.ORGVIEWER_KEYCLOAK_CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    throw new Error(`Keycloak token request failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()
  return {
    access_token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
}

// Client-credentials tokens are shared across all browser sessions (there's
// no per-user identity here), so we cache one token server-side instead of
// minting a fresh one per request. `inflight` collapses concurrent misses
// into a single Keycloak call instead of a thundering herd.
export const getServiceToken = async (): Promise<Token> => {
  if (cached && cached.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return cached
  }

  if (!inflight) {
    inflight = fetchToken()
      .then((token) => {
        cached = token
        return token
      })
      .finally(() => {
        inflight = null
      })
  }

  return inflight
}
