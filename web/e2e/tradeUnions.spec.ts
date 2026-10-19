import { expect, test, type Page } from "@playwright/test"
import { blockMutations, login, moGraphql, resolveFixture } from "./helpers"

// The association forms list the trade unions valid on the form's start date,
// grouped by confederation. Seeds a probe confederation with one trade union
// valid today and one valid from FUTURE via the API; the forms themselves are
// mutation-blocked.

// 60 days out: past every fixture class, inside every unit's validity.
const FUTURE = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0]
const TODAY = new Date().toISOString().split("T")[0]
const TAG = Math.random().toString(36).slice(2, 8)
const NOW_NAME = `Probe Now ${TAG}`
const FUTURE_NAME = `Probe Future ${TAG}`

const classes: string[] = []
let nowUuid: string
let futureUuid: string
let associationUuid: string

const facetUuid = async (userKey: string): Promise<string> =>
  (
    await moGraphql(
      "query ($keys: [String!]) { facets(filter: { user_keys: $keys }) { objects { uuid } } }",
      { keys: [userKey] }
    )
  ).facets.objects[0].uuid

const createClass = async (input: object): Promise<string> => {
  const uuid = (
    await moGraphql(
      "mutation ($input: ClassCreateInput!) { class_create(input: $input) { uuid } }",
      { input }
    )
  ).class_create.uuid
  classes.push(uuid)
  return uuid
}

test.beforeAll(async () => {
  const tradeUnion = await facetUuid("trade_union")
  const confederation = await createClass({
    facet_uuid: await facetUuid("confederation"),
    name: `Probe Confederation ${TAG}`,
    user_key: `tradeunion-probe-confederation-${TAG}`,
    validity: { from: "2000-01-01" },
  })
  nowUuid = await createClass({
    facet_uuid: tradeUnion,
    name: NOW_NAME,
    user_key: `tradeunion-probe-now-${TAG}`,
    parent_uuid: confederation,
    validity: { from: "2000-01-01" },
  })
  futureUuid = await createClass({
    facet_uuid: tradeUnion,
    name: FUTURE_NAME,
    user_key: `tradeunion-probe-future-${TAG}`,
    parent_uuid: confederation,
    validity: { from: FUTURE },
  })

  const fixture = await resolveFixture()
  const associationType = (
    await moGraphql(
      '{ classes(filter: { facet: { user_keys: "association_type" } }, limit: 1) { objects { uuid } } }'
    )
  ).classes.objects[0].uuid
  associationUuid = (
    await moGraphql(
      "mutation ($input: AssociationCreateInput!) { association_create(input: $input) { uuid } }",
      {
        input: {
          person: fixture.person,
          org_unit: fixture.unit,
          association_type: associationType,
          trade_union: nowUuid,
          validity: { from: fixture.from },
        },
      }
    )
  ).association_create.uuid
})

test.afterAll(async () => {
  await moGraphql(
    "mutation ($uuid: UUID!) { association_delete(uuid: $uuid) { uuid } }",
    {
      uuid: associationUuid,
    }
  )
  // Children before their confederation.
  for (const uuid of classes.reverse())
    await moGraphql("mutation ($uuid: UUID!) { class_delete(uuid: $uuid) { uuid } }", {
      uuid,
    })
})

// The trade union select is the form's last.
const tradeUnionSelect = (page: Page) => page.locator("form #select:visible").last()

const tradeUnionOptions = async (page: Page): Promise<string[]> => {
  await tradeUnionSelect(page).click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  const texts = await page.locator(".list-item").allInnerTexts()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(200)
  return texts.map((text) => text.trim())
}

const setStartDate = async (page: Page, value: string) => {
  await page.locator("form input[type=date]").first().fill(value)
  await page.waitForTimeout(2000) // let the options refetch land
}

const posted = (page: Page) => page.locator("form input[name=trade-union]")
const shown = (page: Page, name: string) =>
  page.locator("form").getByText(name, { exact: true })

for (const side of ["employee", "organisation"] as const) {
  test(`${side} create association: trade unions follow the start date`, async ({
    page,
  }) => {
    const fixture = await resolveFixture()
    const owner = side === "employee" ? fixture.person : fixture.unit
    await blockMutations(page)
    await page.goto(`/${side}/${owner}/create/association`)
    await login(page)

    let options = await tradeUnionOptions(page)
    expect(options, "valid today").toContain(NOW_NAME)
    expect(options, "not valid until FUTURE").not.toContain(FUTURE_NAME)

    await setStartDate(page, FUTURE)
    expect(await tradeUnionOptions(page)).toContain(FUTURE_NAME)

    await tradeUnionSelect(page).click()
    await page
      .locator(".list-item")
      .filter({ has: page.getByText(FUTURE_NAME, { exact: true }) })
      .click()
    await page.waitForTimeout(400)
    await expect(posted(page)).toHaveValue(futureUuid)

    // Moving back drops the future trade union: neither posted nor shown.
    await setStartDate(page, TODAY)
    await expect(posted(page)).toHaveCount(0)
    await expect(shown(page, FUTURE_NAME)).toHaveCount(0)
    options = await tradeUnionOptions(page)
    expect(options).not.toContain(FUTURE_NAME)
  })

  test(`${side} edit association: keeps the trade union, dates the options`, async ({
    page,
  }) => {
    const fixture = await resolveFixture()
    const owner = side === "employee" ? fixture.person : fixture.unit
    await blockMutations(page)
    await page.goto(
      `/${side}/${owner}/edit/association/${associationUuid}?from=${fixture.from}`
    )
    await login(page)

    await expect(posted(page)).toHaveValue(nowUuid, { timeout: 15000 })
    await expect(shown(page, NOW_NAME)).toHaveCount(1)

    await setStartDate(page, FUTURE)
    await expect(posted(page)).toHaveValue(nowUuid)
    expect(await tradeUnionOptions(page)).toContain(FUTURE_NAME)
  })
}
