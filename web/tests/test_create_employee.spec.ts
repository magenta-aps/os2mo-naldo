import { test } from "./fixtures/snapshot.ts"
import { expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test("should create employee", async ({ page, moClient, snapshot }) => {
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

  const graphqlResponse = await page.waitForResponse(
    (response) => response.url().includes("/graphql") && response.status() === 200
  )

  const response = await graphqlResponse.json()
  expect(response).toHaveProperty("data.employee_create.current.name", "first last")
})

test("should create employee and address", async ({ page, moClient, snapshot }) => {
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

  const graphqlResponse = await page.waitForResponse(
    (response) => response.url().includes("/graphql") && response.status() === 200
  )

  const response = await graphqlResponse.json()
  expect(response).toHaveProperty("data.employee_create.current.name", "first last")
  const employeeUuid = response.data.employee_create.current.uuid

  await page.goto(`http://localhost:5173/employee/${employeeUuid}/create/address`)

  await expect(page.getByRole("button", { name: "Create address" })).toBeVisible()
})
