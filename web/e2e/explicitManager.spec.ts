import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  login,
  moGraphql,
  pickFirstOption,
  resolveFixture,
  searchAndPick,
  trackPageErrors,
  type Fixture,
} from "./helpers"

// Seeds a boss with a manager role in a probe unit, and a probe staff member
// whose engagement in the fixture unit points at that role; the smoke suite
// edits the fixture person's own engagement in parallel. Leftovers from a
// crashed run: a unit prefixed `explicit-probe-` and people named
// `Explicit Probe Boss` / `Explicit Probe Staff`.

const EXPLICIT_TITLE = /Eksplicit leder|Explicit manager/
// Selects in order on the engagement forms: job function, engagement type,
// primary, manager role.
const ROLE_SELECT = 3

let fixture: Fixture
let unit: string
let boss: { uuid: string; name: string }
let staff: string
let staffName: string
let role: string
let engagement: string

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
    ].map(firstClass)
  )

  const suffix = Math.random().toString(36).slice(2, 8)
  unit = await create("org_unit_create", "OrganisationUnitCreateInput", {
    name: `Explicit Probe Unit ${suffix}`,
    user_key: "explicit-probe-" + suffix,
    parent: fixture.unit,
    org_unit_type: unitType,
    validity: { from: fixture.from },
  })
  boss = {
    uuid: await create("employee_create", "EmployeeCreateInput", {
      given_name: "Explicit Probe",
      surname: `Boss ${suffix}`,
    }),
    name: `Explicit Probe Boss ${suffix}`,
  }
  staffName = `Explicit Probe Staff ${suffix}`
  staff = await create("employee_create", "EmployeeCreateInput", {
    given_name: "Explicit Probe",
    surname: `Staff ${suffix}`,
  })
  role = await create("manager_create", "ManagerCreateInput", {
    person: boss.uuid,
    org_unit: unit,
    manager_type: managerType,
    manager_level: managerLevel,
    responsibility: [responsibility],
    validity: { from: fixture.from },
  })
  engagement = await create("engagement_create", "EngagementCreateInput", {
    person: staff,
    org_unit: fixture.unit,
    engagement_type: engagementType,
    job_function: jobFunction,
    explicit_manager: role,
    validity: { from: fixture.from },
  })
})

test.afterAll(async () => {
  if (engagement) await remove("engagement_delete", engagement)
  if (role) await remove("manager_delete", role)
  if (unit) await remove("org_unit_delete", unit)
  for (const person of [staff, boss?.uuid].filter(Boolean))
    await remove("employee_delete", person)
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

const roleInput = (page: Page) => page.locator('form input[name="explicit-manager"]')

// Every Search labels its input "autocomplete", so the label's wrapper and
// text tell the explicit manager's person search from the unit search.
const explicitManagerSearch = (page: Page) =>
  page
    .locator('form div:has(> label[for="autocomplete"])', { hasText: EXPLICIT_TITLE })
    .locator("input[type=text]")

// Searches the boss in the explicit manager's person field, then picks the
// boss's only manager role in the nth Select.
const pickExplicitManager = async (page: Page, roleSelect: number) => {
  await explicitManagerSearch(page).fill(boss.name)
  await page.locator(".list-item").first().waitFor({ timeout: 15_000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await pickFirstOption(page, roleSelect)
  await expect(roleInput(page)).toHaveValue(role)
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

// Nothing tells a form that did not submit from one that has yet to, so this
// waits a fixed time; the suite's other submit checks do the same.
const submit = async (page: Page) => {
  await page.locator("form button[type=submit]").click()
  await page.waitForTimeout(1500)
}

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
  await pickFirstOption(page, 0)
  await pickFirstOption(page, 1)
  await pickExplicitManager(page, ROLE_SELECT)

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input.explicit_manager).toBe(role)
  expect(errors).toEqual([])
})

test("employee edit keeps the explicit manager on an unrelated edit", async ({
  page,
}) => {
  const { errors, sent } = await openForm(
    page,
    `/employee/${staff}/edit/engagement/${engagement}?from=${fixture.from}`
  )
  await expect(roleInput(page)).toHaveValue(role)
  await page.locator("#user-key").fill("explicit-probe-edit")

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  // Omitted, MO keeps it.
  expect(sent[0].input).not.toHaveProperty("explicit_manager")
  expect(errors).toEqual([])
})

for (const side of ["employee", "organisation"] as const) {
  test(`${side} edit unsets a cleared explicit manager`, async ({ page }) => {
    const owner = side === "employee" ? staff : fixture.unit
    const { errors, sent } = await openForm(
      page,
      `/${side}/${owner}/edit/engagement/${engagement}?from=${fixture.from}`
    )
    await expect(roleInput(page)).toHaveValue(role)
    await page
      .locator(".form-control", { has: page.locator('label[for="explicit-manager"]') })
      .locator(".clear-select")
      .click()
    await expect(roleInput(page)).toHaveCount(0)

    await submit(page)
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
  await expect(row).toContainText(boss.name)
  // The engagement Select placeholder is gone once the list loads.
  await pickExplicitManager(page, 0)

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input).toEqual([
    expect.objectContaining({ uuid: engagement, explicit_manager: role }),
  ])
  expect(errors).toEqual([])
})

test("the bulk form without a manager unsets it", async ({ page }) => {
  const { errors, sent } = await openBulkForm(page)
  await expect(page.locator("form button[type=submit]")).toHaveText(
    /Fjern eksplicit leder|Remove explicit manager/
  )

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input).toEqual([
    expect.objectContaining({ uuid: engagement, explicit_manager: null }),
  ])
  expect(errors).toEqual([])
})
