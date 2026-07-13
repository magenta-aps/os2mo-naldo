import { env } from "$lib/env"
import { isAdmin, isAuth } from "$lib/stores/auth"
import Keycloak from "keycloak-js"

export let keycloak: Keycloak

export const initKeycloak = async () => {
  // Keycloak config is provided directly via env vars.
  if (
    !env.PUBLIC_KEYCLOAK_URL ||
    !env.PUBLIC_KEYCLOAK_REALM ||
    !env.PUBLIC_KEYCLOAK_CLIENT_ID
  ) {
    isAuth.set(true)
    console.error("Keycloak config is not set")
    console.info("Starting with no authentication ...")
    return
  }

  keycloak = new Keycloak({
    url: env.PUBLIC_KEYCLOAK_URL,
    realm: env.PUBLIC_KEYCLOAK_REALM,
    clientId: env.PUBLIC_KEYCLOAK_CLIENT_ID,
  })
  keycloak
    .init({ onLoad: "login-required" })
    .then((authenticated) => {
      isAuth.set(true)
      console.info("Authenticated:", authenticated)

      // Weak check if user is admin
      // FIXME: Make correct check maybe?
      if (keycloak.tokenParsed?.realm_access?.roles.includes("class_admin")) {
        isAdmin.set(true)
      }

      // Token refresh
      setInterval(() => {
        keycloak.updateToken(15).catch(() => {
          console.error("Failed to refresh token")
        })
      }, 5000)
    })
    .catch((error) => {
      isAuth.set(false)
      isAdmin.set(false)
      console.error("Failed to auth:", error)
      alert("failed to auth")
    })
}

export const logoutKeycloak = () => {
  isAuth.set(false)
  isAdmin.set(false)
  keycloak.logout({
    redirectUri: `${window.location.origin}/logged-out`,
  })
}
