import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/")
  await page.goto(
    "http://localhost:5000/auth/realms/mo/protocol/openid-connect/auth?client_id=mo-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&state=b759a144-163a-4fbe-99d2-3693c6bcf5d5&response_mode=fragment&response_type=code&scope=openid&nonce=b91cd5fd-5fa4-41e8-88aa-fe041b03126f"
  )
  await page.getByLabel("Username").click()
  await page.getByLabel("Username").fill("alvida")
  await page.getByLabel("Username").click()
  await page.getByLabel("Password").fill("alvida")
  await page.getByRole("button", { name: "Sign In" }).click()
  await page.locator("div").filter({ hasText: /^AN$/ }).first().click()
  await page.getByRole("button", { name: "Logout" }).click()
  expect(page.getByRole("heading", { name: "Sign in to your account" }))
})
