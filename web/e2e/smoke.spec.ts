import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  dismiss,
  EDIT_SIDES,
  graphqlIdle,
  isoDay,
  login,
  resolveEditTargets,
  resolveFixture,
  trackPageErrors,
  type EditTargets,
  type Fixture,
} from "./helpers"

// A frozen page hangs the next interaction until the test timeout kills the
// worker; that is the freeze detection.

const sidedEditRoutes = () => {
  const routes: Record<string, (f: Fixture, t: EditTargets) => string | null> = {}
  for (const [type, { sides }] of Object.entries(EDIT_SIDES)) {
    for (const side of sides) {
      const base = side === "person" ? "employee" : "organisation"
      routes[`${side === "person" ? "employee" : "org"} edit ${type}`] = (
        fixture,
        targets
      ) => {
        const target = targets[type]?.[side]
        return target
          ? `/${base}/${target.owner}/edit/${type}/${target.uuid}?from=${target.from}`
          : null
      }
    }
  }
  return routes
}

// Returning null skips the test (the fixture lacks that object type).
const ROUTES: Record<string, (f: Fixture, t: EditTargets) => string | null> = {
  "employee create engagement": (fixture) =>
    `/employee/${fixture.person}/create/engagement`,
  "employee create address": (fixture) => `/employee/${fixture.person}/create/address`,
  "employee create ituser": (fixture) => `/employee/${fixture.person}/create/ituser`,
  "employee create manager": (fixture) => `/employee/${fixture.person}/create/manager`,
  "employee create leave": (fixture) => `/employee/${fixture.person}/create/leave`,
  "employee create association": (fixture) =>
    `/employee/${fixture.person}/create/association`,
  "org create engagement": (fixture) =>
    `/organisation/${fixture.unit}/create/engagement`,
  "org create address": (fixture) => `/organisation/${fixture.unit}/create/address`,
  "org create ituser": (fixture) => `/organisation/${fixture.unit}/create/ituser`,
  "org create manager": (fixture) => `/organisation/${fixture.unit}/create/manager`,
  "org create association": (fixture) =>
    `/organisation/${fixture.unit}/create/association`,
  "org create kle": (fixture) => `/organisation/${fixture.unit}/create/kle`,
  "org create unit": (fixture) => `/organisation/${fixture.unit}/create/unit`,
  "employee edit engagement": (fixture) =>
    `/employee/${fixture.person}/edit/engagement/${fixture.engagement}?from=${fixture.from}`,
  "org edit engagement": (fixture) =>
    `/organisation/${fixture.unit}/edit/engagement/${fixture.engagement}?from=${fixture.from}`,
  "employee edit": (fixture) => `/employee/${fixture.person}/edit`,
  "org edit unit": (fixture) =>
    `/organisation/${fixture.unit}/edit/unit?from=${fixture.from}`,
  ...sidedEditRoutes(),
  "admin classifications": () => `/admin/facet`,
  "admin create class": () => `/admin/facet/create/class`,
  "admin create itsystem": () => `/admin/itsystem/create`,
}

const DATE1 = isoDay()
const DATE2 = isoDay(40)

const setStartDate = async (page: Page, value: string) => {
  const from = page.locator("form input[type=date]").first()
  if ((await from.count()) === 0) return
  await dismiss(page)
  await from.fill(value)
  await graphqlIdle(page)
}

const pickAllSelects = async (page: Page) => {
  const n = await page.locator("form #select").count()
  for (let i = 0; i < n; i++) {
    await dismiss(page)
    try {
      await page.locator(`form #select >> nth=${i}`).click({ timeout: 5000 })
    } catch {
      continue // selects legitimately appear/disappear as the form re-gates
    }
    const gotItems = await page
      .locator(".list-item")
      .first()
      .waitFor({ timeout: 2500 })
      .then(() => true)
      .catch(() => false)
    if (gotItems) {
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
    } else {
      await page.keyboard.press("Escape")
    }
    // A form stuck refetching in a reactivity loop never goes quiet.
    await graphqlIdle(page)
  }
}

for (const [name, urlFor] of Object.entries(ROUTES)) {
  test(name, async ({ page }) => {
    const url = urlFor(await resolveFixture(), await resolveEditTargets())
    test.skip(!url, "fixture has no object of this type")
    const errors = trackPageErrors(page)
    await blockMutations(page)
    await page.goto(url!)
    await login(page)
    // Guard against vacuous passes: a page that rendered nothing must fail.
    if (name !== "admin classifications") {
      await expect(page.locator("form").first()).toBeVisible({ timeout: 15_000 })
    }

    await setStartDate(page, DATE1)
    await pickAllSelects(page)
    await setStartDate(page, DATE2)
    await pickAllSelects(page)

    await dismiss(page)
    for (const input of await page
      .locator("form input[type=text]:not([readonly])")
      .all()) {
      await input.fill("smoke", { timeout: 4000 }).catch(() => {})
    }

    await page.evaluate(() => 1) // hangs if the page froze along the way
    expect(errors).toEqual([])
  })
}
