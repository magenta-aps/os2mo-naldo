import { env } from "$lib/env"
import { isAdmin, isAuth } from "$lib/stores/auth"
import Keycloak from "keycloak-js"

const instance = `${env.PUBLIC_BASE_URL}/service/keycloak.json`

export let keycloak: Keycloak

export const initKeycloak = async () => {
  const res = await fetch(instance)

  if (res.status === 404) {
    isAuth.set(true)
    console.error("keycloak.json could not be fetched")
    console.info("Starting with no authentication ...")
    return
  }

  keycloak = new Keycloak(instance)
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
  keycloak.logout()
}
