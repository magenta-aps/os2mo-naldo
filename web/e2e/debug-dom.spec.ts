import { test } from "@playwright/test"
import * as fs from "fs"

test("dump DOM after typing in parent search", async ({ page }) => {
  await page.goto("/organisation/create/unit")
  await page.waitForSelector('input[id="from"]', { timeout: 15_000 })

  const form = page.locator("form")

  // Fill start date first
  await form.locator('input[id="from"]').fill("2025-01-01")

  // Type in the parent search
  const parentInput = form.locator("#autocomplete")
  await parentInput.click()
  await parentInput.pressSequentially("Kolding", { delay: 50 })

  // Wait for network request to complete
  await page.waitForTimeout(3000)

  const html = await page.content()
  fs.writeFileSync("/home/mb/Desktop/test/os2mo-naldo/web/e2e/debug-dom.html", html)

  // Also take a screenshot
  await page.screenshot({
    path: "/home/mb/Desktop/test/os2mo-naldo/web/e2e/debug-screenshot.png",
    fullPage: true,
  })
})
