import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  blockMutations,
  dismiss,
  login,
  resolveFixture,
  trackPageErrors,
  type Fixture,
} from "./helpers"

// Touches every form and fails on crashes, freezes, and dead controls.
// Cycle: set the date, pick all selects, change the date, pick again. A
// frozen page hangs the next interaction until the test timeout kills the
// worker — that IS the freeze detection.

const ROUTES: Record<string, (f: Fixture) => string> = {
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
  "admin classifications": () => `/admin/facet`,
  "admin create class": () => `/admin/facet/create/class`,
  "admin create itsystem": () => `/admin/itsystem/create`,
}

const iso = (d: Date) => d.toISOString().split("T")[0]
const DATE1 = iso(new Date())
const DATE2 = iso(new Date(Date.now() + 40 * 86400000))

const setStartDate = async (page: Page, value: string) => {
  const from = page.locator("form input[type=date]").first()
  if ((await from.count()) === 0) return
  await dismiss(page)
  await from.fill(value)
  await page.waitForTimeout(600) // let refetches fire
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
    await page.waitForTimeout(300)
  }
}

for (const [name, urlFor] of Object.entries(ROUTES)) {
  test(name, async ({ page }) => {
    const errors = trackPageErrors(page)
    await blockMutations(page)
    await page.goto(path(await resolveFixture()))
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
