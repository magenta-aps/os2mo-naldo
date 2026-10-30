import { expect, test, type Page } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  facetUuid,
  firstClassUuid,
  isoDay,
  login,
  pickExactOption,
  probeTag,
  resolveFixture,
  selectOptions,
} from "./helpers"

// 60 days out: past every fixture class, inside every unit's validity.
const FUTURE = isoDay(60)
const TODAY = isoDay()
const TAG = probeTag()
const NOW_NAME = `Probe Now ${TAG}`
const FUTURE_NAME = `Probe Future ${TAG}`

// Created parents first, so deleting in reverse removes children first.
const classes: string[] = []
let nowUuid: string
let futureUuid: string
let associationUuid: string | undefined

const createClass = async (input: object): Promise<string> => {
  const uuid = await createInMo("class", "ClassCreateInput", input)
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
  associationUuid = await createInMo("association", "AssociationCreateInput", {
    person: fixture.person,
    org_unit: fixture.unit,
    association_type: await firstClassUuid("association_type"),
    trade_union: nowUuid,
    validity: { from: fixture.from },
  })
})

test.afterAll(async () => {
  if (associationUuid) await deleteInMo("association", associationUuid)
  for (const uuid of classes.reverse()) await deleteInMo("class", uuid)
})

const tradeUnionOptions = (page: Page) => selectOptions(page, "trade-union")

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

    await pickExactOption(page, "trade-union", FUTURE_NAME)
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
