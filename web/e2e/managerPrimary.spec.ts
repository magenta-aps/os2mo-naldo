import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  dismiss,
  firstClassUuid,
  login,
  pickExactOption,
  pickFirstOption,
  pickMultiFirstOption,
  probeTag,
  resolveFixture,
  resolvePrimaryClass,
  searchAndPick,
  submitForm,
  trackPageErrors,
  type ClassRef,
  type Fixture,
} from "./helpers"

// The roles belong to a probe person, not the fixture person, because the
// smoke suite edits the fixture person's first manager role in parallel.

const TAKEN_MESSAGE = /allerede en primær leder|already has a primary manager/
const LOAD_ERROR = /Noget gik galt|Something went wrong/

let fixture: Fixture
let primary: ClassRef
let holder: { uuid: string; name: string }
let taken: { unit: string; name: string; primaryRole: string; otherRole: string }
let free: { unit: string }

test.beforeAll(async () => {
  fixture = await resolveFixture()
  primary = await resolvePrimaryClass()
  const [unitType, managerType, managerLevel, responsibility] = await Promise.all(
    ["org_unit_type", "manager_type", "manager_level", "responsibility"].map(
      firstClassUuid
    )
  )
  const createUnit = (name: string) =>
    createInMo("org_unit", "OrganisationUnitCreateInput", {
      name: name,
      user_key: `primary-probe-${probeTag()}`,
      parent: fixture.unit,
      org_unit_type: unitType,
      validity: { from: fixture.from },
    })
  const createManagerRole = (unit: string, primaryClass: string | null) =>
    createInMo("manager", "ManagerCreateInput", {
      person: holder.uuid,
      org_unit: unit,
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: [responsibility],
      primary: primaryClass,
      validity: { from: fixture.from },
    })

  const suffix = probeTag()
  const holderSurname = `Holder ${suffix}`
  holder = {
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Primary Probe",
      surname: holderSurname,
    }),
    name: `Primary Probe ${holderSurname}`,
  }
  const takenName = `Primary Probe Taken ${suffix}`
  const takenUnit = await createUnit(takenName)
  free = { unit: await createUnit(`Primary Probe Free ${suffix}`) }
  taken = {
    unit: takenUnit,
    name: takenName,
    primaryRole: await createManagerRole(takenUnit, primary.uuid),
    otherRole: await createManagerRole(takenUnit, null),
  }
})

test.afterAll(async () => {
  for (const role of [taken?.primaryRole, taken?.otherRole].filter(Boolean))
    await deleteInMo("manager", role)
  for (const unit of [taken?.unit, free?.unit].filter(Boolean))
    await deleteInMo("org_unit", unit)
  if (holder) await deleteInMo("employee", holder.uuid)
})

const isLookup = (postData: string | null) => !!postData?.includes("PrimaryManagers")

// Resolves once the conflict lookup has answered and the page has rendered its
// result, so an absent conflict message means there is none. Start it before
// the action that triggers the lookup.
const lookupSettled = (page: Page) =>
  page
    .waitForResponse(
      (r) => r.url().includes("/graphql/") && isLookup(r.request().postData())
    )
    .then(() => page.evaluate(() => new Promise(requestAnimationFrame)))

const openForm = async (page: Page, path: string) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto(path)
  await login(page)
  await expect(page.locator("form").first()).toBeVisible({ timeout: 15_000 })
  return { errors, sent }
}

// The fields every manager create form requires besides the primary class.
const fillRequiredFields = async (page: Page) => {
  await page.check("#no-engagement")
  await pickFirstOption(page, "manager-type")
  await pickFirstOption(page, "manager-level")
  await pickMultiFirstOption(page, "responsibility")
  await dismiss(page)
}

test("org create sends the primary class in a unit without one", async ({ page }) => {
  const { errors, sent } = await openForm(
    page,
    `/organisation/${free.unit}/create/manager`
  )
  await fillRequiredFields(page)
  const settled = lookupSettled(page)
  await pickExactOption(page, "primary", primary.name)
  await settled
  await expect(page.getByText(TAKEN_MESSAGE)).toBeHidden()

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input.primary).toBe(primary.uuid)
  expect(errors).toEqual([])
})

test("employee create lists the unit's primary manager and blocks", async ({
  page,
}) => {
  const { errors, sent } = await openForm(
    page,
    `/employee/${fixture.person}/create/manager`
  )
  await searchAndPick(page, taken.name)
  await fillRequiredFields(page)
  await pickExactOption(page, "primary", primary.name)

  const message = page.locator("form div", { hasText: TAKEN_MESSAGE }).last()
  await expect(message).toBeVisible()
  await expect(message).toContainText(holder.name)

  await submitForm(page)
  expect(sent, "a duplicate primary manager must not be submitted").toHaveLength(0)
  expect(errors).toEqual([])
})

test("a failed lookup blocks the submit", async ({ page }) => {
  const { errors, sent } = await openForm(
    page,
    `/organisation/${free.unit}/create/manager`
  )
  // Registered after blockMutations, so it sees requests first.
  await page.route("**/graphql/**", (route) =>
    isLookup(route.request().postData()) ? route.abort() : route.fallback()
  )
  await fillRequiredFields(page)
  await pickExactOption(page, "primary", primary.name)
  await expect(page.getByText(LOAD_ERROR)).toBeVisible()

  await submitForm(page)
  expect(sent, "an unchecked primary class must not be submitted").toHaveLength(0)
  expect(errors).toEqual([])
})

for (const side of ["organisation", "employee"] as const) {
  test(`${side} edit keeps a manager role's own primary and can unset it`, async ({
    page,
  }) => {
    const owner = side === "organisation" ? taken.unit : holder.uuid
    const settled = lookupSettled(page)
    const { errors, sent } = await openForm(
      page,
      `/${side}/${owner}/edit/manager/${taken.primaryRole}?from=${fixture.from}`
    )
    const primaryInput = page.locator('form input[name="primary"]')
    await expect(primaryInput).toHaveValue(primary.uuid)
    await settled
    // The manager role being edited is no conflict with itself.
    await expect(page.getByText(TAKEN_MESSAGE)).toBeHidden()

    await page
      .locator(".form-control", { has: page.locator('label[for="primary"]') })
      .locator(".clear-select")
      .click()
    // Select drops its hidden input when cleared; the action then sends null.
    await expect(primaryInput).toHaveCount(0)

    await submitForm(page)
    expect(sent, "the form must submit").toHaveLength(1)
    expect(sent[0].input.primary).toBeNull()
    expect(errors).toEqual([])
  })
}

test("a person's other manager role in the unit conflicts", async ({ page }) => {
  const { errors, sent } = await openForm(
    page,
    `/organisation/${taken.unit}/edit/manager/${taken.otherRole}?from=${fixture.from}`
  )
  await pickExactOption(page, "primary", primary.name)

  const message = page.locator("form div", { hasText: TAKEN_MESSAGE }).last()
  await expect(message).toBeVisible()
  await expect(message).toContainText(holder.name)

  await submitForm(page)
  expect(sent, "a second primary role must not be submitted").toHaveLength(0)
  expect(errors).toEqual([])
})
