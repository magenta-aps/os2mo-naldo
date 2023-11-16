import { test, expect } from "@playwright/test"

test("test should create a person", async ({ page }) => {
  await page.goto("http://localhost:5173/")
  await page.goto(
    "http://localhost:5000/auth/realms/mo/protocol/openid-connect/auth?client_id=mo-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&state=dd8b7de8-91da-4d5c-9a00-2aef4ec57009&response_mode=fragment&response_type=code&scope=openid&nonce=95a1c394-eede-4af2-82f6-ef393cd59601"
  )
  await page.getByLabel("Username").click()
  await page.getByLabel("Username").fill("alvida")
  await page.getByLabel("Password").click()
  await page.getByLabel("Password").fill("alvida")
  await page.getByLabel("Password").press("Enter")
  await page.getByRole("link", { name: "Ny medarbejder" }).click()
  await page.getByLabel("CPR nummer *").click()
  await page.getByLabel("CPR nummer *").fill("0204954567")
  await page.getByLabel("Fornavn *").click()
  await page.getByLabel("Fornavn *").fill("test")
  await page.getByLabel("Efternavn(e) *").click()
  await page.getByLabel("Efternavn(e) *").fill("testersen")
  await page.getByRole("button", { name: "Opret medarbejder" }).click()
  expect(page.getByRole("heading", { name: "test testersen (020495-4567)" }))
})

test("test should create an engagement for the created person", async ({ page }) => {
  await page.goto("/")
  await page.goto(
    "http://localhost:5000/auth/realms/mo/protocol/openid-connect/auth?client_id=mo-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&state=940f8e3a-96b9-4940-8c53-6eb8aa56c962&response_mode=fragment&response_type=code&scope=openid&nonce=35702278-cfe0-4ef1-9357-7f99c8eea6b6"
  )
  await page.getByLabel("Username").click()
  await page.getByLabel("Username").fill("alvida")
  await page.getByLabel("Password").click()
  await page.getByLabel("Password").fill("alvida")
  await page.getByLabel("Password").press("Enter")
  await page.getByPlaceholder("Søg efter person").click()
  await page.getByPlaceholder("Søg efter person").fill("test testersen")
  await page.getByText("test testersen").click()
  await page.getByRole("link", { name: "Engagementer" }).click()
  await page.getByRole("link", { name: "Tilføj Engagementer" }).click()
  await page.getByPlaceholder("Søg efter organisation").click()
  await page.getByPlaceholder("Søg efter organisation").fill("Kolding kommune")
  await page
    .locator(".form-control > div > .svelte-select > .indicators")
    .first()
    .click()
  await page.getByText("Bogopsætter").first().click()
  await page
    .locator(
      "div:nth-child(5) > div > .form-control > div > .svelte-select > .indicators"
    )
    .first()
    .click()
  await page.getByText("Ansat").first().click()
  await page.getByRole("button", { name: "Opret engagement" }).click()
})

test("test should create a leave for the created person", async ({ page }) => {
  await page.goto("/")
  await page.goto(
    "http://localhost:5000/auth/realms/mo/protocol/openid-connect/auth?client_id=mo-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&state=5b5c1dd6-32e3-44ba-ad6a-b95a54bf4598&response_mode=fragment&response_type=code&scope=openid&nonce=af055574-3072-47eb-8393-205bdaf2215c"
  )
  await page.getByLabel("Username").click()
  await page.getByLabel("Username").fill("alvida")
  await page.getByLabel("Password").click()
  await page.getByLabel("Password").fill("alvida")
  await page.getByRole("button", { name: "Sign In" }).click()
  await page.getByRole("link", { name: "Orlov" }).click()
  await page
    .locator(".form-control > div > .svelte-select > .indicators")
    .first()
    .click()
  await page.getByText("Barselsorlov").click()
  await page.getByRole("textbox", { name: "Søg efter person", exact: true }).click()
  await page
    .getByRole("textbox", { name: "Søg efter person", exact: true })
    .fill("test testersen")
  await page.waitForTimeout(1000)
  await page.getByText("test testersen").click()
  await page.waitForTimeout(1000)
  await page
    .locator("div:nth-child(5) > .form-control > div > .svelte-select > .indicators")
    .click()
  await page.getByText("Bogopsætter, Kolding Kommune").first().click()
  await page.getByRole("button", { name: "Opret orlov" }).click()
})
