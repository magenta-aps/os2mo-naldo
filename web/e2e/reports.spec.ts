import type { Page, Route } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { readFile } from "node:fs/promises"
import { blockMutations, login, trackPageErrors, uploadExport } from "./helpers"

const REPORT = "e2e-probe-report.csv"
const NOTES = "e2e-probe-notes.json"
const CSV = "name;count\nprobe;1\n"
const UNSUPPORTED = /Unsupported file type|Filtypen understøttes ikke/

test.beforeAll(async () => {
  await uploadExport(REPORT, CSV)
  await uploadExport(NOTES, "{}")
})

const isFileQuery = (route: Route) => {
  try {
    const query: string = JSON.parse(route.request().postData() ?? "").query ?? ""
    return /query ReportFile\b/.test(query)
  } catch {
    return false
  }
}

// Network and MO failures cannot be produced on demand, so `answerFile`
// stands in for MO's answer to the file query.
const openReports = async (
  page: Page,
  answerFile?: (route: Route) => Promise<void>
) => {
  const errors = trackPageErrors(page)
  await blockMutations(page)
  if (answerFile)
    // Registered after blockMutations, so it sees requests first.
    await page.route("**/graphql/**", (route) =>
      isFileQuery(route) ? answerFile(route) : route.fallback()
    )
  await page.goto("/reports")
  await login(page)
  return errors
}

const downloadButton = (page: Page, fileName: string) =>
  page.locator("tr", { hasText: fileName }).getByRole("button")
const errorToast = (page: Page) => page.locator(".toast .alert-error")

test("a report downloads under its own name", async ({ page }) => {
  const errors = await openReports(page)
  const download = page.waitForEvent("download")
  await downloadButton(page, REPORT).click()

  const saved = await download
  expect(saved.suggestedFilename()).toBe(REPORT)
  expect(await readFile((await saved.path())!, "utf8")).toBe(CSV)
  await expect(errorToast(page)).toHaveCount(0)
  expect(errors).toEqual([])
})

test("an unsupported file type is refused", async ({ page }) => {
  const errors = await openReports(page)
  const downloads: unknown[] = []
  page.on("download", (download) => downloads.push(download))
  await downloadButton(page, NOTES).click()

  await expect(errorToast(page)).toContainText(UNSUPPORTED)
  await expect(downloadButton(page, NOTES)).toBeEnabled()
  expect(downloads).toHaveLength(0)
  expect(errors).toEqual([])
})

test("a failed download shows an error and can be retried", async ({ page }) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => (release = resolve))
  const errors = await openReports(page, async (route) => {
    await held
    await route.abort()
  })
  const button = downloadButton(page, REPORT)
  await button.click()
  await expect(button).toBeDisabled()

  release()
  await expect(errorToast(page)).toBeVisible()
  await expect(button).toBeEnabled()
  expect(errors).toEqual([])
})

test("an error from MO is shown", async ({ page }) => {
  const errors = await openReports(page, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: null,
        errors: [{ message: "report probe failure" }],
      }),
    })
  )
  await downloadButton(page, REPORT).click()

  await expect(errorToast(page)).toContainText("report probe failure")
  await expect(downloadButton(page, REPORT)).toBeEnabled()
  expect(errors).toEqual([])
})
