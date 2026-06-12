import { test, expect, createFacet, createClass, createOrgUnit } from "./base"

async function setupOrgUnit(request: any) {
  const facetUuid = await createFacet(request, "org_unit_type")
  const typeUuid = await createClass(request, {
    name: "Kommune",
    user_key: "kommune",
    facet_uuid: facetUuid,
  })
  const uuid = await createOrgUnit(request, {
    name: "Testbyen Kommune",
    org_unit_type: typeUuid,
  })
  return { uuid, name: "Testbyen Kommune" }
}

// The OrgTree fires its first fetch before Keycloak initialises, so that request
// goes out with no token and is rejected. Auth then completes, and a $date store
// write from the SearchBar debounce triggers a second fetch with a valid token.
// We wait for a *successful* OrgUnitsWithChildren response (no GraphQL errors)
// so the assertion only runs after the tree has real data.
async function waitForOrgTreeSuccess(page: any) {
  return page.waitForResponse(
    async (res: any) => {
      if (!res.url().includes("/graphql")) return false
      if (res.request().postDataJSON()?.operationName !== "OrgUnitsWithChildren")
        return false
      const body = await res.json()
      return !body.errors?.length
    },
    { timeout: 10_000 }
  )
}

test("sidebar tree shows a created org unit and navigating to it works", async ({
  page,
  request,
}) => {
  const { uuid, name } = await setupOrgUnit(request)

  const treeReady = waitForOrgTreeSuccess(page)
  await page.goto("/")
  await treeReady

  await page.locator(`a[href="/organisation/${uuid}"]`).click()
  await expect(page).toHaveURL(new RegExp(`/organisation/${uuid}`))
  await expect(page.locator("h1")).toContainText(name)
})

test("navigated org unit is highlighted as active in the sidebar", async ({
  page,
  request,
}) => {
  const { uuid, name } = await setupOrgUnit(request)

  const treeReady = waitForOrgTreeSuccess(page)
  await page.goto(`/organisation/${uuid}`)
  await treeReady

  await expect(page.locator("#active")).toContainText(name)
})

test("org unit detail page shows tabs and unit number", async ({ page, request }) => {
  const { uuid, name } = await setupOrgUnit(request)

  await page.goto(`/organisation/${uuid}`)
  await page.waitForLoadState("networkidle")

  await expect(page.locator("h1")).toContainText(name)
  await expect(page.locator('a[href="#engagement"]')).toBeVisible()
  await expect(page.locator('a[href="#address"]')).toBeVisible()
  // user_key defaults to the UUID when not specified — just check the label exists
  await expect(
    page.locator("p.text-sm:not(.text-secondary)").filter({
      hasText: /Unit number:/,
    })
  ).toBeVisible()
})
