import { test, expect, createEmployee, terminateEmployee } from "./base"

test("created employee appears in search and detail page renders correctly", async ({
  page,
  request,
}) => {
  // ── Setup: create a real employee via GraphQL ────────────────────────────
  const uuid = await createEmployee(request, {
    given_name: "Tove",
    surname: "Testperson",
  })

  // ── Search: employee shows up in the navbar search ───────────────────────
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.locator("#autocomplete").pressSequentially("Tove")
  await expect(page.getByText("Tove Testperson").first()).toBeVisible()

  // ── Navigate: click result lands on the detail page ─────────────────────
  await page.getByText("Tove Testperson").first().click()
  await expect(page).toHaveURL(new RegExp(`/employee/${uuid}`))
  await expect(page.locator("h1")).toContainText("Tove Testperson")

  // ── Detail page: standard tabs are present ───────────────────────────────
  await expect(page.locator('a[href="#engagement"]')).toBeVisible()
  await expect(page.locator('a[href="#address"]')).toBeVisible()
})

test("navigating directly to an employee UUID shows the correct name", async ({
  page,
  request,
}) => {
  const uuid = await createEmployee(request, {
    given_name: "Erik",
    surname: "Direktetest",
  })

  await page.goto(`/employee/${uuid}`)
  await page.waitForLoadState("networkidle")
  await expect(page.locator("h1")).toContainText("Erik Direktetest")
})

test("terminated employee no longer appears in search", async ({ page, request }) => {
  const uuid = await createEmployee(request, { given_name: "Ulla", surname: "Udgaaet" })

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  await terminateEmployee(request, uuid, yesterday.toISOString().split("T")[0])

  // The employee should no longer appear in the present-date search
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.locator("#autocomplete").pressSequentially("Ulla")
  await expect(page.getByText("Ulla Udgaaet")).not.toBeAttached()
})
