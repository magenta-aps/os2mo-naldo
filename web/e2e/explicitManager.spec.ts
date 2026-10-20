import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  firstClassUuid,
  login,
  pickFirstOption,
  probeTag,
  resolveFixture,
  searchAndPick,
  submitForm,
  trackPageErrors,
  type Fixture,
} from "./helpers"

// Seeds a boss with a manager role in a probe unit, and a probe staff member
// whose engagement in the fixture unit points at that role; the smoke suite
// edits the fixture person's own engagement in parallel. Leftovers from a
// crashed run: a unit prefixed `explicit-probe-` and people named
// `Explicit Probe Boss` / `Explicit Probe Staff`.

const EXPLICIT_TITLE = /Eksplicit leder|Explicit manager/

let fixture: Fixture
let unit: string
let boss: { uuid: string; name: string }
let staff: string
let managerRole: string
let engagement: string

test.beforeAll(async () => {
  fixture = await resolveFixture()
  const [
    unitType,
    managerType,
    managerLevel,
    responsibility,
    engagementType,
    jobFunction,
  ] = await Promise.all(
    [
      "org_unit_type",
      "manager_type",
      "manager_level",
      "responsibility",
      "engagement_type",
      "engagement_job_function",
    ].map(firstClassUuid)
  )

  const suffix = probeTag()
  unit = await createInMo("org_unit", "OrganisationUnitCreateInput", {
    name: `Explicit Probe Unit ${suffix}`,
    user_key: "explicit-probe-" + suffix,
    parent: fixture.unit,
    org_unit_type: unitType,
    validity: { from: fixture.from },
  })
  boss = {
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Explicit Probe",
      surname: `Boss ${suffix}`,
    }),
    name: `Explicit Probe Boss ${suffix}`,
  }
  staff = await createInMo("employee", "EmployeeCreateInput", {
    given_name: "Explicit Probe",
    surname: `Staff ${suffix}`,
  })
  managerRole = await createInMo("manager", "ManagerCreateInput", {
    person: boss.uuid,
    org_unit: unit,
    manager_type: managerType,
    manager_level: managerLevel,
    responsibility: [responsibility],
    validity: { from: fixture.from },
  })
  engagement = await createInMo("engagement", "EngagementCreateInput", {
    person: staff,
    org_unit: fixture.unit,
    engagement_type: engagementType,
    job_function: jobFunction,
    explicit_manager: managerRole,
    validity: { from: fixture.from },
  })
})

test.afterAll(async () => {
  if (engagement) await deleteInMo("engagement", engagement)
  if (managerRole) await deleteInMo("manager", managerRole)
  if (unit) await deleteInMo("org_unit", unit)
  for (const person of [staff, boss?.uuid].filter(Boolean))
    await deleteInMo("employee", person)
})

const openForm = async (page: Page, path: string) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto(path)
  await login(page)
  await expect(page.locator("form").first()).toBeVisible({ timeout: 15_000 })
  return { errors, sent }
}

// The edit form validates its required fields on submit, and those render
// only once their options load, after the explicit manager field. Waiting for
// the prefilled job function keeps a fast test from submitting a form that
// is still loading.
const openEditForm = async (page: Page, path: string) => {
  const form = await openForm(page, path)
  await expect(page.locator('form input[name="job-function"]')).toHaveCount(1)
  return form
}

const managerRoleInput = (page: Page) =>
  page.locator('form input[name="explicit-manager"]')

// Every Search labels its input "autocomplete", so the label's wrapper and
// text tell the explicit manager's person search from the unit search.
const explicitManagerSearch = (page: Page) =>
  page
    .locator('form div:has(> label[for="autocomplete"])', { hasText: EXPLICIT_TITLE })
    .locator("input[type=text]")

for (const side of ["employee", "organisation"] as const) {
  test(`the ${side} engagement table marks the explicit manager`, async ({ page }) => {
    const errors = trackPageErrors(page)
    const owner = side === "employee" ? staff : fixture.unit
    await page.goto(`/${side}/${owner}#engagement`)
    await login(page)
    const cell = page.locator("td", { hasText: boss.name })
    await expect(cell).toBeVisible({ timeout: 15_000 })
    await expect(cell.getByTitle(EXPLICIT_TITLE)).toBeVisible()
    expect(errors).toEqual([])
  })
}

test("employee create sends the explicit manager", async ({ page }) => {
  const { errors, sent } = await openForm(page, `/employee/${staff}/create/engagement`)
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "job-function")
  await pickFirstOption(page, "engagement-type")

  await explicitManagerSearch(page).fill(boss.name)
  await page.locator(".list-item").first().waitFor({ timeout: 15_000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await pickFirstOption(page, "explicit-manager")
  await expect(managerRoleInput(page)).toHaveValue(managerRole)

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input.explicit_manager).toBe(managerRole)
  expect(errors).toEqual([])
})

test("employee edit keeps the explicit manager on an unrelated edit", async ({
  page,
}) => {
  const { errors, sent } = await openEditForm(
    page,
    `/employee/${staff}/edit/engagement/${engagement}?from=${fixture.from}`
  )
  await expect(managerRoleInput(page)).toHaveValue(managerRole)
  await page.locator("#user-key").fill("explicit-probe-edit")

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  // Omitted, MO keeps it.
  expect(sent[0].input).not.toHaveProperty("explicit_manager")
  expect(errors).toEqual([])
})

for (const side of ["employee", "organisation"] as const) {
  test(`${side} edit unsets a cleared explicit manager`, async ({ page }) => {
    const owner = side === "employee" ? staff : fixture.unit
    const { errors, sent } = await openEditForm(
      page,
      `/${side}/${owner}/edit/engagement/${engagement}?from=${fixture.from}`
    )
    await expect(managerRoleInput(page)).toHaveValue(managerRole)
    await page
      .locator(".form-control", { has: page.locator('label[for="explicit-manager"]') })
      .locator(".clear-select")
      .click()
    await expect(managerRoleInput(page)).toHaveCount(0)

    await submitForm(page)
    expect(sent, "the form must submit").toHaveLength(1)
    expect(sent[0].input.explicit_manager).toBeNull()
    expect(errors).toEqual([])
  })
}
