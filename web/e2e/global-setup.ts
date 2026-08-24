import { chromium } from "@playwright/test"
import { login } from "./helpers"

// Logs in once and saves the Keycloak session — every test context starts
// pre-authenticated instead of paying the redirect dance per test. The
// login helper in the tests stays as a no-op safety net (and app-shell wait)
// in case the saved session has expired.
export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173")
  await login(page)
  await page.context().storageState({ path: "e2e/.auth/state.json" })
  await browser.close()
}
