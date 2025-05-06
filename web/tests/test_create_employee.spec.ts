import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test("should create employee mock", async ({ page }) => {
  // Intercept GraphQL POST requests
  await page.route("**/graphql/**", async (route, request) => {
    const postData = await request.postDataJSON()

    // Match the mutation name and check that the values are sent in the request
    if (postData.operationName === "CreateEmployee") {
      const input = postData.variables.input

      // Log to see the payload being sent
      // console.log('Intercepted GraphQL mutation:', postData)

      // Ensure the values from the form are correctly passed in the mutation
      expect(input.cpr_number).toBe("1234567890")
      expect(input.given_name).toBe("first")
      expect(input.surname).toBe("last")
      expect(input.nickname_given_name).toBe("nickname-first")
      expect(input.nickname_surname).toBe("nickname-last")

      // Respond with a mocked response matching the real API response
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            employee_create: {
              current: {
                name: "first last",
                uuid: uuidv4(),
              },
            },
          },
        }),
      })
    }

    return route.continue()
  })

  // Visit the page
  await page.goto("http://localhost:5173/")

  // Keycloak login
  await page.getByRole("textbox", { name: "Username" }).fill("alvida")
  await page.getByRole("textbox", { name: "Password" }).fill("alvida")
  await page.getByRole("button", { name: "Sign In" }).click()

  // Fill out the form
  await page.getByRole("link", { name: "New employee" }).click()
  await page.locator("#cpr-number").fill("1234567890")
  await page.locator("#first-name").fill("first")
  await page.locator("#last-name").fill("last")
  await page.locator("#nickname-first-name").fill("nickname-first")
  await page.locator("#nickname-last-name").fill("nickname-last")

  // Submit the form
  await page.getByRole("button", { name: "Create employee" }).click()

  await page.waitForResponse(
    (response) => response.url().includes("/graphql") && response.status() === 200
  )
})
