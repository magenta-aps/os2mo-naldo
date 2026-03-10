import { test as setup } from "@playwright/test"

const AUTH_FILE = "e2e/.auth/user.json"
const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"

setup("authenticate via Keycloak", async ({ page }) => {
  // First, get the Keycloak config to find the auth-server-url
  const keycloakConfigRes = await fetch(`${BASE_URL}/service/keycloak.json`)
  const keycloakConfig = await keycloakConfigRes.json()
  const authServerUrl = keycloakConfig["auth-server-url"]
  const realm = keycloakConfig["realm"]

  // Navigate to the Keycloak login page directly
  const loginUrl =
    `${authServerUrl}/realms/${realm}/protocol/openid-connect/auth` +
    `?client_id=mo-frontend` +
    `&redirect_uri=${encodeURIComponent(BASE_URL + "/")}` +
    `&response_type=code` +
    `&scope=openid`

  await page.goto(loginUrl)

  // Wait for the Keycloak login form
  await page.waitForSelector("#username", { timeout: 60_000 })

  // Fill in the credentials
  await page.fill("#username", "alvida")
  await page.fill("#password", "alvida")
  await page.click("#kc-login")

  // Wait until we are redirected back to the app
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 60_000 })

  // Persist the authenticated browser state so all tests can reuse it
  await page.context().storageState({ path: AUTH_FILE })
})
