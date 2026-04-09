/**
 * Authenticated GraphQL client for integration tests against a live MO instance.
 *
 * Supports two auth modes:
 * - Client credentials (CI): uses the `dipex` service account via KEYCLOAK_URL
 * - Password grant (local dev): set MO_USERNAME + MO_PASSWORD to use `mo-frontend` client
 *
 * Environment variables:
 *   MO_URL           - MO base URL (default: http://localhost:5000)
 *   KEYCLOAK_URL     - Keycloak base URL (default: derived from MO_URL)
 *   MO_USERNAME      - If set, uses password grant instead of client credentials
 *   MO_PASSWORD      - Password for the above user
 */
import { GraphQLClient } from "graphql-request"

const MO_URL = process.env.MO_URL ?? "http://localhost:5000"
const GRAPHQL_VERSION = "v28"
const GRAPHQL_URL = `${MO_URL}/graphql/${GRAPHQL_VERSION}`

// In CI, keycloak runs as a separate service at http://keycloak:8080/auth
// Locally, it's behind MO's reverse proxy at http://localhost:5000/auth
const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? `${MO_URL}/auth`
const TOKEN_URL = `${KEYCLOAK_URL}/realms/mo/protocol/openid-connect/token`

const CLIENT_ID = "dipex"
const CLIENT_SECRET = "603f1c82-d012-4d04-9382-dbe659c533fb"

let cachedToken: string | null = null

async function fetchToken(): Promise<string> {
  if (cachedToken) return cachedToken

  const params = new URLSearchParams()
  const username = process.env.MO_USERNAME
  const password = process.env.MO_PASSWORD

  if (username && password) {
    params.set("grant_type", "password")
    params.set("client_id", "mo-frontend")
    params.set("username", username)
    params.set("password", password)
  } else {
    params.set("grant_type", "client_credentials")
    params.set("client_id", CLIENT_ID)
    params.set("client_secret", CLIENT_SECRET)
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Keycloak token request failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  cachedToken = json.access_token
  return cachedToken!
}

export async function getClient(): Promise<GraphQLClient> {
  const token = await fetchToken()
  return new GraphQLClient(GRAPHQL_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function isMoAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${MO_URL}/health/live`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}
