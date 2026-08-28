import { expect, test } from "@playwright/test"
import {
  blockMutations,
  login,
  moGraphql,
  resolveFixture,
  selectOptions,
} from "./helpers"

// A future-only class must appear in the engagement form's options when the
// global date moves into its validity, be pickable, clear again as a stale
// selection, and vanish when the date moves back. The probe class is
// seeded/deleted via the API; the form itself is mutation-blocked.

const PROBE_NAME = "Refetch Probe"
// 60 days out: past any fixture class, inside every unit's validity.
const FUTURE = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0]
const TODAY = new Date().toISOString().split("T")[0]

let probeUuid: string

test.beforeAll(async () => {
  const facet = (
    await moGraphql(
      '{ facets(filter: { user_keys: "engagement_job_function" }) { objects { current { uuid } } } }'
    )
  ).facets.objects[0].current.uuid
  probeUuid = (
    await moGraphql(
      "mutation ($input: ClassCreateInput!) { class_create(input: $input) { uuid } }",
      {
        input: {
          facet_uuid: facet,
          name: PROBE_NAME,
          user_key: "refetch-probe-" + Math.random().toString(36).slice(2, 8),
          validity: { from: FUTURE },
        },
      }
    )
  ).class_create.uuid
})

test.afterAll(async () => {
  await moGraphql("mutation ($uuid: UUID!) { class_delete(uuid: $uuid) { uuid } }", {
    uuid: probeUuid,
  })
})

test("date-driven option refetching", async ({ page }) => {
  const fixture = await resolveFixture()
  const formPath = `/employee/${fixture.person}/create/engagement`
  await blockMutations(page)
  await page.goto(formPath)
  await login(page)

  // Navigate in-SPA: a full page load would reset the global date store.
  const spaNav = async (path: string) => {
    await page.evaluate((href) => {
      const a = document.createElement("a")
      a.href = href
      document.body.appendChild(a)
      a.click()
      a.remove()
    }, path)
    await page.waitForTimeout(1200)
  }

  // Set the navbar date picker, then re-enter the form so it seeds its start
  // date from the new global date.
  const setGlobalDate = async (value: string) => {
    await page.locator(".navbar input[type=date]").fill(value)
    await page.waitForTimeout(900) // the navbar debounces 500ms into $date
    await spaNav(`/employee/${fixture.person}`)
    await spaNav(formPath)
    await page.waitForFunction(
      (expected) =>
        document.querySelector<HTMLInputElement>("form input[type=date]")?.value ===
        expected,
      value,
      { timeout: 15000 }
    )
    await page.waitForTimeout(1500) // let the options refetch land
  }

  const hasProbe = async () =>
    (await selectOptions(page)).some((text) => text.includes(PROBE_NAME))

  expect(await hasProbe(), "probe must be absent today").toBe(false)

  await setGlobalDate(FUTURE)
  expect(await hasProbe(), "probe must appear at its start date").toBe(true)

  // Pick it: the form must post the future class's uuid.
  await page.locator("form #select").first().click({ timeout: 8000 })
  await page.locator(`.list-item:has-text("${PROBE_NAME}")`).first().click()
  await page.waitForTimeout(400)
  await expect(page.locator("form input[name=job-function]")).toHaveValue(probeUuid)

  // Moving the form's own date back refetches the options without the probe;
  // the Select must clear the stale selection — browser-only behavior that
  // jsdom cannot reproduce, so only this test covers it. No selection = no
  // hidden input.
  await page.locator("form input[type=date]").first().fill(TODAY)
  await page.waitForTimeout(2000)
  await expect(page.locator("form input[name=job-function]")).toHaveCount(0)

  await setGlobalDate(TODAY)
  expect(await hasProbe(), "probe must vanish back at today").toBe(false)
})
