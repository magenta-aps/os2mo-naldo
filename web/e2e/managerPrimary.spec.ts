import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  dismiss,
  login,
  moGraphql,
  pickExactOption,
  pickFirstOption,
  pickMultiFirstOption,
  resolveFixture,
  resolvePrimaryClass,
  searchAndPick,
  trackPageErrors,
  type ClassRef,
  type Fixture,
} from "./helpers"

// A unit has at most one primary manager role, which MO does not enforce, so
// the manager forms do. A probe person and two probe units under the fixture
// unit are seeded via the API: "taken", where the probe person holds a primary
// manager role and a second one without a primary class, and "free", without a
// primary manager. The roles belong to a probe person, not the fixture person, because
// the smoke suite edits the fixture person's first manager role in parallel.
// All are deleted afterwards; if a crashed run leaves them behind, the units'
// user_keys are prefixed `primary-probe-` and the person is named
// `Primary Probe Holder`.

const TAKEN_MESSAGE = /allerede en primær leder|already has a primary manager/
const LOAD_ERROR = /Noget gik galt|Something went wrong/
// Selects in order on every manager form: engagement, manager type, manager
// level, primary.
const PRIMARY_SELECT = 3

let fixture: Fixture
let primary: ClassRef
let holder: { uuid: string; name: string }
let taken: { unit: string; name: string; primaryRole: string; otherRole: string }
let free: { unit: string }

const firstClass = async (facet: string): Promise<string> =>
  (
    await moGraphql(
      `{ classes(filter: { facet: { user_keys: "${facet}" } }, limit: 1) { objects { uuid } } }`
    )
  ).classes.objects[0].uuid

const create = async (mutation: string, inputType: string, input: object) =>
  (
    await moGraphql(
      `mutation ($input: ${inputType}!) { ${mutation}(input: $input) { uuid } }`,
      { input }
    )
  )[mutation].uuid

const remove = (mutation: string, uuid: string) =>
  moGraphql(`mutation ($uuid: UUID!) { ${mutation}(uuid: $uuid) { uuid } }`, { uuid })

test.beforeAll(async () => {
  fixture = await resolveFixture()
  primary = await resolvePrimaryClass()
  const [unitType, managerType, managerLevel, responsibility] = await Promise.all(
    ["org_unit_type", "manager_type", "manager_level", "responsibility"].map(firstClass)
  )
  const createUnit = (name: string) =>
    create("org_unit_create", "OrganisationUnitCreateInput", {
      name: name,
      user_key: "primary-probe-" + Math.random().toString(36).slice(2, 8),
      parent: fixture.unit,
      org_unit_type: unitType,
      validity: { from: fixture.from },
    })
  const createManagerRole = (unit: string, primaryClass: string | null) =>
    create("manager_create", "ManagerCreateInput", {
      person: holder.uuid,
      org_unit: unit,
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: [responsibility],
      primary: primaryClass,
      validity: { from: fixture.from },
    })

  const suffix = Math.random().toString(36).slice(2, 8)
  const holderSurname = `Holder ${suffix}`
  holder = {
    uuid: await create("employee_create", "EmployeeCreateInput", {
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
    await remove("manager_delete", role)
  for (const unit of [taken?.unit, free?.unit].filter(Boolean))
    await remove("org_unit_delete", unit)
  if (holder) await remove("employee_delete", holder.uuid)
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
  await pickFirstOption(page, 1)
  await pickFirstOption(page, 2)
  await pickMultiFirstOption(page, "responsibility")
  await dismiss(page)
}

// Nothing tells a form that did not submit from one that has yet to, so this
// waits a fixed time; the suite's other submit checks do the same.
const submit = async (page: Page) => {
  await page.locator("form button[type=submit]").click()
  await page.waitForTimeout(1500)
}

test("org create sends the primary class in a unit without one", async ({ page }) => {
  const { errors, sent } = await openForm(
    page,
    `/organisation/${free.unit}/create/manager`
  )
  await fillRequiredFields(page)
  const settled = lookupSettled(page)
  await pickExactOption(page, PRIMARY_SELECT, primary.name)
  await settled
  await expect(page.getByText(TAKEN_MESSAGE)).toBeHidden()

  await submit(page)
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
  await pickExactOption(page, PRIMARY_SELECT, primary.name)

  const message = page.locator("form div", { hasText: TAKEN_MESSAGE }).last()
  await expect(message).toBeVisible()
  await expect(message).toContainText(holder.name)

  await submit(page)
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
  await pickExactOption(page, PRIMARY_SELECT, primary.name)
  await expect(page.getByText(LOAD_ERROR)).toBeVisible()

  await submit(page)
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

    await submit(page)
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
  await pickExactOption(page, PRIMARY_SELECT, primary.name)

  const message = page.locator("form div", { hasText: TAKEN_MESSAGE }).last()
  await expect(message).toBeVisible()
  await expect(message).toContainText(holder.name)

  await submit(page)
  expect(sent, "a second primary role must not be submitted").toHaveLength(0)
  expect(errors).toEqual([])
})
