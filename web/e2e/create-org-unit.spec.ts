import { test, expect } from "@playwright/test"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000"

// Restore the DB snapshot after each test so every test starts from a clean state
test.afterEach(async () => {
  await fetch(`${BASE_URL}/testing/database/restore`, { method: "POST" })
})

test.describe("Create organisation unit", () => {
  test("should create a new org unit via the form", async ({ page }) => {
    await page.goto("/organisation/create/unit")

    // Scope all interactions to the form inside .drawer-content
    const form = page.locator("form")

    // Fill in the start date
    await form.locator('input[id="from"]').fill("2025-01-01")

    // Search and select a parent org unit
    // There are two #autocomplete on the page (navbar + form), so scope to the form
    const parentInput = form.locator("#autocomplete")
    await parentInput.click()
    // Use pressSequentially to trigger input events that svelte-select listens to
    await parentInput.pressSequentially("Kolding", { delay: 50 })
    // svelte-select renders .list-item inside .svelte-select-list
    await page
      .locator(".svelte-select-list .list-item")
      .first()
      .click({ timeout: 15_000 })

    // Fill in the org unit name
    await form.locator('input[id="name"]').fill("Test Afdeling")

    // Select an org unit type (required field)
    // The label "Unit type" is unique — use it to find the right svelte-select
    const orgTypeContainer = form
      .locator("label", { hasText: "Unit type" })
      .locator("..")
    await orgTypeContainer.locator("#select").click()
    await orgTypeContainer
      .locator(".svelte-select-list .list-item")
      .first()
      .click({ timeout: 15_000 })

    // Submit the form
    await form.locator('button[type="submit"]').click()

    // Wait for the success toast
    await expect(page.locator(".alert-success")).toBeVisible({ timeout: 15_000 })
    await expect(page.locator(".alert-success")).toContainText("Test Afdeling")
  })

  test("should require name and org unit type", async ({ page }) => {
    await page.goto("/organisation/create/unit")

    // Fill in only the start date and submit
    await page.fill('input[id="from"]', "2025-01-01")
    await page.locator('button[type="submit"]').click()

    // Validation errors should appear for required fields
    await expect(page.locator(".text-error")).toHaveCount(2, { timeout: 5_000 })
  })
})
