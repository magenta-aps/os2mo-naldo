import { env } from "$lib/env"
import Keycloak from "keycloak-js"
import { browser } from "$app/environment"

const instance = `${env.PUBLIC_BASE_URL}/service/keycloak.json`

export let keycloak: Keycloak

/**
 * Initializes Keycloak and synchronizes the session with the SvelteKit server.
 */
export const initKeycloak = async () => {
  if (!browser) return // SDK requires window object

  const res = await fetch(instance)

  if (res.status === 404) {
    console.warn("Keycloak configuration not found. Running in unauthenticated mode.")
    return
  }

  keycloak = new Keycloak(instance)

  try {
    const authenticated = await keycloak.init({
      onLoad: "login-required",
      // Force redirect back to the app root to avoid ghost /login paths
      redirectUri: window.location.origin,
      checkLoginIframe: false,
    })

    if (authenticated) {
      // Send the token to the server to set the HttpOnly cookie
      await syncTokenToCookie(keycloak.token)

      // Handle token refresh automatically
      keycloak.onTokenExpired = async () => {
        try {
          await keycloak.updateToken(70)
          await syncTokenToCookie(keycloak.token)
        } catch (error) {
          console.error("Failed to refresh OS2MO token", error)
        }
      }
    }
  } catch (error) {
    console.error("OS2MO Authentication Failed:", error)
  }
}

/**
 * Pushes the token to the server-side session API.
 */
async function syncTokenToCookie(token?: string) {
  if (!token) return

  await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  })
}

/**
 * Clears both the server-side cookie and the Keycloak session.
 */
export const logoutKeycloak = async () => {
  // 1. Clear the server session first
  await fetch("/api/session", { method: "DELETE" })

  // 2. Trigger Keycloak logout redirect
  if (keycloak) {
    keycloak.logout({
      redirectUri: `${window.location.origin}/logged-out`,
    })
  }
}
