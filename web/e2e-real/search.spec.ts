import {
  test,
  expect,
  createEmployee,
  createFacet,
  createClass,
  createOrgUnit,
} from "./base"

test("searching for a created employee shows them in the dropdown", async ({
  page,
  request,
}) => {
  await createEmployee(request, { given_name: "Søren", surname: "Søgbar" })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.locator("#autocomplete").pressSequentially("Søre")
  await expect(page.getByText("Søren Søgbar").first()).toBeVisible()
})

test("clicking an employee result navigates to their detail page", async ({
  page,
  request,
}) => {
  const uuid = await createEmployee(request, {
    given_name: "Lene",
    surname: "Linktest",
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.locator("#autocomplete").pressSequentially("Lene")
  await page.getByText("Lene Linktest").first().click()

  await expect(page).toHaveURL(new RegExp(`/employee/${uuid}`))
  await expect(page.locator("h1")).toContainText("Lene Linktest")
})

test("toggling to org-unit mode and finding a created unit", async ({
  page,
  request,
}) => {
  const facetUuid = await createFacet(request, "org_unit_type")
  const typeUuid = await createClass(request, {
    name: "Afdeling",
    user_key: "afdeling",
    facet_uuid: facetUuid,
  })
  await createOrgUnit(request, { name: "Testkontoret", org_unit_type: typeUuid })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.locator("input.toggle").click()
  await page.locator("#autocomplete").pressSequentially("Test")
  await expect(page.getByText("Testkontoret").first()).toBeVisible()
})
