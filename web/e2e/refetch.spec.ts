import { expect, test } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  facetUuid,
  graphqlIdle,
  isoDay,
  login,
  probeTag,
  resolveFixture,
  selectFor,
  selectOptions,
} from "./helpers"

const PROBE_NAME = "Refetch Probe"
// 60 days out: past any fixture class, inside every unit's validity.
const FUTURE = isoDay(60)
const TODAY = isoDay()

let probeUuid: string | undefined

test.beforeAll(async () => {
  probeUuid = await createInMo("class", "ClassCreateInput", {
    facet_uuid: await facetUuid("engagement_job_function"),
    name: PROBE_NAME,
    user_key: `refetch-probe-${probeTag()}`,
    validity: { from: FUTURE },
  })
})

test.afterAll(async () => {
  if (probeUuid) await deleteInMo("class", probeUuid)
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
    await page.waitForURL((url) => url.pathname.endsWith(path))
    await graphqlIdle(page)
  }

  // Set the navbar date picker, then re-enter the form so it seeds its start
  // date from the new global date.
  const setGlobalDate = async (value: string) => {
    await page.locator(".navbar input[type=date]").fill(value)
    // The navbar writes $date on a 500ms timer nothing outside the page can
    // see. Running short fails the form date check below, never passes it.
    await page.waitForTimeout(900)
    await spaNav(`/employee/${fixture.person}`)
    await spaNav(formPath)
    await page.waitForFunction(
      (expected) =>
        document.querySelector<HTMLInputElement>("form input[type=date]")?.value ===
        expected,
      value,
      { timeout: 15000 }
    )
    await graphqlIdle(page)
  }

  const hasProbe = async () =>
    (await selectOptions(page, "job-function")).some((text) =>
      text.includes(PROBE_NAME)
    )

  expect(await hasProbe(), "probe must be absent today").toBe(false)

  await setGlobalDate(FUTURE)
  expect(await hasProbe(), "probe must appear at its start date").toBe(true)

  // Pick it: the form must post the future class's uuid.
  await selectFor(page, "job-function").click({ timeout: 8000 })
  await page.locator(`.list-item:has-text("${PROBE_NAME}")`).first().click()
  await expect(page.locator("form input[name=job-function]")).toHaveValue(probeUuid!)

  // Moving the form's own date back refetches the options without the probe;
  // the Select must clear the stale selection, browser-only behavior that
  // jsdom cannot reproduce, so only this test covers it. No selection = no
  // hidden input.
  await page.locator("form input[type=date]").first().fill(TODAY)
  await graphqlIdle(page)
  await expect(page.locator("form input[name=job-function]")).toHaveCount(0)

  await setGlobalDate(TODAY)
  expect(await hasProbe(), "probe must vanish back at today").toBe(false)
})
