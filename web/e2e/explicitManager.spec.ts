import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  firstClassUuid,
  login,
  pickFirstOption,
  pickOptionByText,
  probeTag,
  resolveFixture,
  searchAndPick,
  searchFor,
  submitForm,
  trackPageErrors,
  type Fixture,
} from "./helpers"

// Seeds a manager holding roles in two probe units, a probe person with a
// single one, and a probe staff member whose engagement in the fixture unit
// points at the manager's first role; the smoke suite edits the fixture person's
// own engagement in parallel. Leftovers from a crashed run: units prefixed
// `explicit-probe-` and people named `Explicit Probe Manager` / `Solo` / `Staff`.

const EXPLICIT_TITLE = /Eksplicit leder|Explicit manager/

let fixture: Fixture
let unit: string
let unitName: string
let otherUnit: string
let manager: { uuid: string; name: string }
let staff: string
let staffName: string
let managerRole: string
let otherRole: string
let solo: { uuid: string; name: string }
let soloRole: string
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
  const createUnit = (name: string) =>
    createInMo("org_unit", "OrganisationUnitCreateInput", {
      name,
      user_key: `explicit-probe-${probeTag()}`,
      parent: fixture.unit,
      org_unit_type: unitType,
      validity: { from: fixture.from },
    })
  unitName = `Explicit Probe Unit ${suffix}`
  unit = await createUnit(unitName)
  otherUnit = await createUnit(`Explicit Probe Other ${suffix}`)
  manager = {
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Explicit Probe",
      surname: `Manager ${suffix}`,
    }),
    name: `Explicit Probe Manager ${suffix}`,
  }
  staffName = `Explicit Probe Staff ${suffix}`
  staff = await createInMo("employee", "EmployeeCreateInput", {
    given_name: "Explicit Probe",
    surname: `Staff ${suffix}`,
  })
  const createManagerRole = (person: string, orgUnit: string) =>
    createInMo("manager", "ManagerCreateInput", {
      person,
      org_unit: orgUnit,
      manager_type: managerType,
      manager_level: managerLevel,
      responsibility: [responsibility],
      validity: { from: fixture.from },
    })
  managerRole = await createManagerRole(manager.uuid, unit)
  otherRole = await createManagerRole(manager.uuid, otherUnit)
  solo = {
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Explicit Probe",
      surname: `Solo ${suffix}`,
    }),
    name: `Explicit Probe Solo ${suffix}`,
  }
  soloRole = await createManagerRole(solo.uuid, unit)
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
  for (const role of [managerRole, otherRole, soloRole].filter(Boolean))
    await deleteInMo("manager", role)
  for (const orgUnit of [unit, otherUnit].filter(Boolean))
    await deleteInMo("org_unit", orgUnit)
  for (const person of [staff, manager?.uuid, solo?.uuid].filter(Boolean))
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

// Searches the manager in the explicit manager's person field, then picks
// the role in the probe unit; the manager has a second one.
const pickExplicitManager = async (page: Page) => {
  await searchAndPick(page, manager.name, EXPLICIT_TITLE)
  await pickOptionByText(page, "explicit-manager", unitName)
  await expect(managerRoleInput(page)).toHaveValue(managerRole)
}

// The bulk form lists the fixture unit's engagements; only the staff member's
// is checked, so the fixture person's engagement must never be sent.
const openBulkForm = async (page: Page) => {
  const form = await openForm(page, "/organisation/explicit-manager")
  await searchAndPick(page, fixture.unitName)
  const row = page.locator("#engagement-list label", { hasText: staffName })
  await row.locator("input[type=checkbox]").check()
  return { ...form, row }
}

for (const side of ["employee", "organisation"] as const) {
  test(`the ${side} engagement table marks the explicit manager`, async ({ page }) => {
    const errors = trackPageErrors(page)
    const owner = side === "employee" ? staff : fixture.unit
    await page.goto(`/${side}/${owner}#engagement`)
    await login(page)
    const cell = page.locator("td", { hasText: manager.name })
    await expect(cell).toBeVisible({ timeout: 15_000 })
    await expect(cell.getByTitle(EXPLICIT_TITLE)).toBeVisible()
    expect(errors).toEqual([])
  })
}

test("employee engagement create sends the explicit manager", async ({ page }) => {
  const { errors, sent } = await openForm(page, `/employee/${staff}/create/engagement`)
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "job-function")
  await pickFirstOption(page, "engagement-type")

  await pickExplicitManager(page)

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input.explicit_manager).toBe(managerRole)
  expect(errors).toEqual([])
})

test("employee engagement create does not submit a person without a manager role", async ({
  page,
}) => {
  const { errors, sent } = await openForm(page, `/employee/${staff}/create/engagement`)
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "job-function")
  await pickFirstOption(page, "engagement-type")
  await searchAndPick(page, manager.name, EXPLICIT_TITLE)
  await expect(page.getByText(/Vælg en lederrolle|Choose a manager role/)).toBeVisible()

  await submitForm(page)
  expect(sent, "a person without a manager role must not be submitted").toHaveLength(0)
  expect(errors).toEqual([])
})

test("employee engagement create picks a person's only manager role", async ({
  page,
}) => {
  const { errors } = await openForm(page, `/employee/${staff}/create/engagement`)
  await searchAndPick(page, solo.name, EXPLICIT_TITLE)
  await expect(managerRoleInput(page)).toHaveValue(soloRole)
  expect(errors).toEqual([])
})

test("employee engagement edit keeps the explicit manager on an unrelated edit", async ({
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
  test(`${side} engagement edit unsets the explicit manager when its person is cleared`, async ({
    page,
  }) => {
    const owner = side === "employee" ? staff : fixture.unit
    const { errors, sent } = await openEditForm(
      page,
      `/${side}/${owner}/edit/engagement/${engagement}?from=${fixture.from}`
    )
    await expect(managerRoleInput(page)).toHaveValue(managerRole)
    await searchFor(page, EXPLICIT_TITLE).locator(".clear-select").click()
    await expect(managerRoleInput(page)).toHaveCount(0)

    await submitForm(page)
    expect(sent, "the form must submit").toHaveLength(1)
    expect(sent[0].input.explicit_manager).toBeNull()
    expect(errors).toEqual([])
  })
}

test("the bulk form assigns the manager to the checked engagements only", async ({
  page,
}) => {
  const { errors, sent, row } = await openBulkForm(page)
  // The current explicit manager is listed, so the user sees what changes.
  await expect(row).toContainText(manager.name)
  await pickExplicitManager(page)

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input).toEqual([
    expect.objectContaining({ uuid: engagement, explicit_manager: managerRole }),
  ])
  expect(errors).toEqual([])
})

test("the bulk form without a manager unsets it", async ({ page }) => {
  const { errors, sent } = await openBulkForm(page)
  await expect(page.locator("form button[type=submit]")).toHaveText(
    /Fjern eksplicit leder|Remove explicit manager/
  )

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input).toEqual([
    expect.objectContaining({ uuid: engagement, explicit_manager: null }),
  ])
  expect(errors).toEqual([])
})
