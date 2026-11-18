import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  createInMo,
  deleteInMo,
  firstClassUuid,
  isoDay,
  login,
  moGraphql,
  probeTag,
  resolveFixture,
  trackPageErrors,
  type Fixture,
} from "./helpers"

// Every scenario is a unit below a shared parent unit, whose manager is
// `parentManagerPerson`. Showing them needs MO to walk up the tree, which
// PUBLIC_INHERIT_MANAGER turns on in CI and the dev setup. Leftovers from a
// crashed run: units prefixed `managers-probe-` and people named
// `Managers Probe …`.

const MANAGER_HEADER = /^(Leder|Manager)$/
const FUTURE_TAB = /^(Fremtid|Future)$/

type Person = { uuid: string; name: string }

let fixture: Fixture
let parent: string
let parentManagerPerson: Person
let parentManagerRole: string

// A unit with two managers
let pairUnit: string
let first: Person
let second: Person
let firstRole: string
let secondRole: string
let firstEngagement: string
let secondEngagement: string

// A unit with one manager and an employee
let soloUnit: string
let soloManager: Person
let employee: Person
let soloRole: string
let soloManagerEngagement: string
let employeeEngagement: string

// A unit whose only manager role passes from `before` to `after` in 30 days
let handoverUnit: string
let before: Person
let after: Person
let handoverRole: string
let beforeEngagement: string
let afterEngagement: string

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
  const createUnit = (name: string, parentUnit: string) =>
    createInMo("org_unit", "OrganisationUnitCreateInput", {
      name: `Managers Probe ${name} ${suffix}`,
      user_key: `managers-probe-${probeTag()}`,
      parent: parentUnit,
      org_unit_type: unitType,
      validity: { from: fixture.from },
    })
  const createPerson = async (label: string): Promise<Person> => ({
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Managers Probe",
      surname: `${label} ${suffix}`,
    }),
    name: `Managers Probe ${label} ${suffix}`,
  })
  const managerRole = (person: Person, unit: string, from: string) => ({
    person: person.uuid,
    org_unit: unit,
    manager_type: managerType,
    manager_level: managerLevel,
    responsibility: [responsibility],
    validity: { from },
  })
  const createRole = (person: Person, unit: string) =>
    createInMo("manager", "ManagerCreateInput", managerRole(person, unit, fixture.from))
  const createEngagement = (person: Person, unit: string, from = fixture.from) =>
    createInMo("engagement", "EngagementCreateInput", {
      person: person.uuid,
      org_unit: unit,
      engagement_type: engagementType,
      job_function: jobFunction,
      validity: { from },
    })

  parent = await createUnit("Parent", fixture.unit)
  parentManagerPerson = await createPerson("Parent Manager")
  parentManagerRole = await createRole(parentManagerPerson, parent)

  pairUnit = await createUnit("Pair", parent)
  first = await createPerson("First")
  second = await createPerson("Second")
  firstRole = await createRole(first, pairUnit)
  secondRole = await createRole(second, pairUnit)
  firstEngagement = await createEngagement(first, pairUnit)
  secondEngagement = await createEngagement(second, pairUnit)

  soloUnit = await createUnit("Solo", parent)
  soloManager = await createPerson("Solo")
  employee = await createPerson("Employee")
  soloRole = await createRole(soloManager, soloUnit)
  soloManagerEngagement = await createEngagement(soloManager, soloUnit)
  employeeEngagement = await createEngagement(employee, soloUnit)

  // Both engagements start in 10 days, so they are listed under the future,
  // whose period also holds both people's time in the role.
  handoverUnit = await createUnit("Handover", parent)
  before = await createPerson("Before")
  after = await createPerson("After")
  handoverRole = await createRole(before, handoverUnit)
  // The role keeps its uuid and is held by `after` from day 30 on.
  await moGraphql(
    "mutation ($input: ManagerUpdateInput!) { manager_update(input: $input) { uuid } }",
    {
      input: {
        uuid: handoverRole,
        ...managerRole(after, handoverUnit, isoDay(30)),
      },
    }
  )
  beforeEngagement = await createEngagement(before, handoverUnit, isoDay(10))
  afterEngagement = await createEngagement(after, handoverUnit, isoDay(10))
})

test.afterAll(async () => {
  for (const engagement of [
    firstEngagement,
    secondEngagement,
    soloManagerEngagement,
    employeeEngagement,
    beforeEngagement,
    afterEngagement,
  ].filter(Boolean))
    await deleteInMo("engagement", engagement)
  for (const role of [
    parentManagerRole,
    firstRole,
    secondRole,
    soloRole,
    handoverRole,
  ].filter(Boolean))
    await deleteInMo("manager", role)
  // The parent goes last, after the units below it
  for (const unit of [pairUnit, soloUnit, handoverUnit, parent].filter(Boolean))
    await deleteInMo("org_unit", unit)
  for (const person of [
    parentManagerPerson?.uuid,
    first?.uuid,
    second?.uuid,
    soloManager?.uuid,
    employee?.uuid,
    before?.uuid,
    after?.uuid,
  ].filter(Boolean))
    await deleteInMo("employee", person)
})

const openEngagements = async (page: Page, unit: string) => {
  const errors = trackPageErrors(page)
  await page.goto(`/organisation/${unit}#engagement`)
  await login(page)
  return errors
}

// Found by its header, as the optional columns before it move it. The row is
// found by its first cell, the person, as a manager's name also appears in the
// manager cell of the other rows.
const managerCell = async (page: Page, person: Person) => {
  const headers = await page.locator("thead th").allInnerTexts()
  const column = headers.findIndex((text) => MANAGER_HEADER.test(text.trim()))
  expect(column, "the table must have a manager column").toBeGreaterThanOrEqual(0)
  return page
    .locator("tr", { has: page.locator("td:first-child", { hasText: person.name }) })
    .locator("td")
    .nth(column)
}

test.describe("a unit with two managers", () => {
  test("each manager shows the other", async ({ page }) => {
    const errors = await openEngagements(page, pairUnit)
    for (const [manager, other] of [
      [first, second],
      [second, first],
    ] as const) {
      const cell = await managerCell(page, manager)
      await expect(cell).toContainText(other.name, { timeout: 15_000 })
      await expect(cell).not.toContainText(manager.name)
    }
    expect(errors).toEqual([])
  })
})

test.describe("a unit with one manager", () => {
  test("the manager shows the parent unit's manager", async ({ page }) => {
    const errors = await openEngagements(page, soloUnit)
    const cell = await managerCell(page, soloManager)
    await expect(cell).toContainText(parentManagerPerson.name, { timeout: 15_000 })
    await expect(cell).not.toContainText(soloManager.name)
    await expect(await managerCell(page, employee)).toContainText(soloManager.name)
    expect(errors).toEqual([])
  })
})

// MO leaves a person's whole manager role out of their own row, also the part
// someone else held, so neither holder sees the other.
test.describe("a manager role passed between people", () => {
  test("both holders show the parent unit's manager", async ({ page }) => {
    const errors = await openEngagements(page, handoverUnit)
    await page.getByRole("button", { name: FUTURE_TAB }).click()
    for (const [holder, other] of [
      [before, after],
      [after, before],
    ] as const) {
      const cell = await managerCell(page, holder)
      await expect(cell).toContainText(parentManagerPerson.name, { timeout: 15_000 })
      await expect(cell).not.toContainText(other.name)
    }
    expect(errors).toEqual([])
  })
})
