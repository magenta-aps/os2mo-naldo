import { test, expect } from "./base"

test("homepage renders with search bar and authenticated user", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("#autocomplete")).toBeVisible()
  // Real Keycloak login — navbar shows actual username, not the unauthenticated fallback
  await expect(page.getByText("No Auth")).not.toBeAttached()
})

test("sidebar renders", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await expect(page.locator(".drawer-side").first()).toBeVisible()
})

test("CANARY - this test must fail to confirm CI is real", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("h1")).toContainText(
    "this text cannot possibly exist in the app"
  )
})

test("reports page is reachable", async ({ page }) => {
  await page.goto("/reports")
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
