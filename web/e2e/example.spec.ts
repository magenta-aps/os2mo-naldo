import { test, expect } from "@playwright/test"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"

// Get a Bearer token from Keycloak using the password grant
async function getKeycloakToken(): Promise<string> {
  const tokenUrl = `${BASE_URL}/auth/realms/mo/protocol/openid-connect/token`
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: "mo-frontend",
      username: "alvida",
      password: "alvida",
    }),
  })
  const json = await res.json()
  return json.access_token
}

// Restore the DB snapshot after each test so every test starts from a clean state
test.afterEach(async () => {
  await fetch(`${BASE_URL}/testing/database/restore`, { method: "POST" })
})

test.describe("OS2mo after login", () => {
  test("should load the main page as authenticated user", async ({ page }) => {
    await page.goto("/")

    // The page should not redirect to Keycloak (we're already authenticated)
    await expect(page).not.toHaveURL(/.*auth.*/)

    // The app should render
    await expect(page.locator("body")).not.toBeEmpty()
  })

  test("should be able to query the GraphQL API", async () => {
    const token = await getKeycloakToken()

    const response = await fetch(`${BASE_URL}/graphql/v27`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query { org { uuid } }`,
      }),
    })

    expect(response.ok).toBeTruthy()

    const body = await response.json()
    expect(body.data.org.uuid).toBeTruthy()
  })
})
