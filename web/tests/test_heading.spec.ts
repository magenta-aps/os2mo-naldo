import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/")

  // Keycloak auth
  await page.goto(
    "http://localhost:5000/auth/realms/mo/protocol/openid-connect/auth?client_id=mo-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&state=3d6e3ebc-d1ef-4d55-8fba-52a04e651842&response_mode=fragment&response_type=code&scope=openid&nonce=effbcb36-03e2-4f34-905d-899f30df314d"
  )
  await page.getByLabel("Password").click()
  await page.getByLabel("Password").fill("alvida")
  await page.getByRole("button", { name: "Sign In" }).click()

  // Expect header
  expect(page.getByRole("heading", { name: "Velkommen til MO" }))
})
