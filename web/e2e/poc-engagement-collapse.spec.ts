import { expect, test, type Page } from "@playwright/test"
import { login, resolveFixture } from "./helpers"

// TEMPORARY verification for the collapsed-engagement POC. The local MO has no
// engagement with more than one validity, so the slices are injected into the
// GraphQL response instead of written to the database.
type Slice = { from: string; to: string | null; job: string; key?: string }

// Copenhagen offsets, as MO returns them: +01:00 in winter, +02:00 in summer.
// Getting this wrong shifts the rendered day by one.
const iso = (day: string | null) =>
  day
    ? `${day}T00:00:00${
        day.slice(5, 7) >= "04" && day.slice(5, 7) < "10" ? "+02:00" : "+01:00"
      }`
    : null

const injectSlices = (page: Page, slices: Slice[]) =>
  page.route("**/graphql/v29", async (route) => {
    const body = route.request().postData() ?? ""
    if (!body.includes("query Engagements")) return route.fallback()

    const response = await route.fetch()
    const json = await response.json()
    const target = json.data?.engagements?.objects?.[0]
    if (target) {
      const template = target.validities[0]
      target.validities = slices.map((slice) => ({
        ...template,
        user_key: slice.key ?? template.user_key,
        job_function_response: {
          ...template.job_function_response,
          current: { ...template.job_function_response.current, name: slice.job },
        },
        validity: { from: iso(slice.from), to: iso(slice.to) },
      }))
      json.data.engagements.objects = [target]
    }
    await route.fulfill({ response, json })
  })

const openEngagements = async (page: Page, person: string) => {
  await page.goto(`/employee/${person}`)
  await login(page)
  await page.getByRole("link", { name: "Employments", exact: true }).click()
  // Show every tense, so a row appearing in more than one is visible
  await page.getByRole("button", { name: "Future", exact: true }).click()
  await page.getByRole("button", { name: "Past", exact: true }).click()
  // Each section fetches on its own; widths are only meaningful once they all
  // have their rows
  await expect(page.getByText("Loading")).toHaveCount(0)
}

// The table scrolls horizontally; park it left so screenshots are readable
const parkLeft = (page: Page) =>
  page.evaluate(() =>
    document.querySelectorAll(".overflow-x-auto").forEach((el) => (el.scrollLeft = 0))
  )

test.use({ viewport: { width: 1800, height: 1000 } })

// The three tense sections each fetch, so a route callback can still be running
// when a test ends, which Playwright counts as a failure.
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" })
})

test("one row per engagement, with its changes behind a disclosure", async ({
  page,
}) => {
  const fixture = await resolveFixture()

  await injectSlices(page, [
    { from: "2019-01-01", to: "2023-01-01", job: "Sagsbehandler", key: "A-1" },
    // Two fields move at once, so this period owns two lines
    { from: "2023-01-01", to: "2024-06-01", job: "Specialkonsulent", key: "A-2" },
    // Identical to the slice before it: MO split on something this table does
    // not show, so the two must fold into one period
    { from: "2024-06-01", to: "2026-01-01", job: "Specialkonsulent", key: "A-2" },
    { from: "2026-01-01", to: null, job: "Afdelingsleder", key: "A-2" },
  ])
  await openEngagements(page, fixture.person)

  // One row, not one per validity
  const disclosure = page.getByRole("button", { name: /change/ })
  await expect(disclosure).toHaveCount(1)
  // Four slices, two of which fold together, leaves three periods = two changes
  await expect(disclosure).toHaveText(/2 changes/)

  // The row shows the values valid today, not the first or last slice's
  await expect(
    page.getByRole("cell", { name: "Afdelingsleder", exact: true })
  ).toBeVisible()

  await disclosure.click()

  // One line per changed field, not one line per period
  await expect(page.getByText("Sagsbehandler → Specialkonsulent")).toBeVisible()
  await expect(page.getByText("A-1 → A-2")).toBeVisible()
  await expect(page.getByText("Specialkonsulent → Afdelingsleder")).toBeVisible()
  await expect(page.getByText("Shown above")).toBeVisible()

  // The run's first period marks where it starts, not when it was registered,
  // and summarises what it started with on one line
  const start = page.getByRole("button", { name: /as of 01-01-2019/ })
  await expect(start.getByText("Start", { exact: true })).toBeVisible()
  await expect(start).toContainText("Sagsbehandler")

  await parkLeft(page)
  await page.screenshot({ path: "test-results/poc-engagement.png", fullPage: true })
})

test("hovering a period shows the engagement as it stood then", async ({ page }) => {
  const fixture = await resolveFixture()

  await injectSlices(page, [
    { from: "2019-01-01", to: "2023-01-01", job: "Sagsbehandler", key: "A-1" },
    { from: "2023-01-01", to: null, job: "Afdelingsleder", key: "A-2" },
  ])
  await openEngagements(page, fixture.person)
  await page.getByRole("button", { name: /change/ }).click()

  const jobToday = page.getByRole("cell", { name: "Afdelingsleder", exact: true })
  const jobThen = page.getByRole("cell", { name: "Sagsbehandler", exact: true })

  await expect(jobToday).toBeVisible()
  await expect(jobThen).toHaveCount(0)

  // Focus does what hover does, so the preview is reachable without a pointer
  await page.getByRole("button", { name: /as of 01-01-2019/ }).focus()
  await expect(jobThen).toBeVisible()
  await expect(jobToday).toHaveCount(0)

  await parkLeft(page)
  await page.screenshot({ path: "test-results/poc-preview.png", fullPage: true })

  await page.getByRole("button", { name: /as of 01-01-2019/ }).blur()
  await expect(jobToday).toBeVisible()
})

test("the pointer crossing between periods does not flash back to today", async ({
  page,
}) => {
  const fixture = await resolveFixture()

  await injectSlices(page, [
    { from: "2019-01-01", to: "2023-01-01", job: "Sagsbehandler", key: "A-1" },
    { from: "2023-01-01", to: "2026-01-01", job: "Specialkonsulent", key: "A-2" },
    { from: "2026-01-01", to: null, job: "Afdelingsleder", key: "A-3" },
  ])
  await openEngagements(page, fixture.person)
  await page.getByRole("button", { name: /change/ }).click()

  const cell = (name: string) => page.getByRole("cell", { name, exact: true })
  const upper = page.getByRole("button", { name: /as of 01-01-2023/ })
  const lower = page.getByRole("button", { name: /as of 01-01-2019/ })
  const [top, bottom] = [await upper.boundingBox(), await lower.boundingBox()]
  if (!top || !bottom) throw new Error("history rows are not on screen")

  await page.mouse.move(top.x + 40, top.y + top.height / 2)
  await expect(cell("Specialkonsulent")).toBeVisible()

  // The stretch between the two rows, where the pointer passes on its way down
  // and neither is hovered. Releasing per period used to revert the row here.
  await page.mouse.move(top.x + 40, (top.y + top.height + bottom.y) / 2)
  await expect(cell("Specialkonsulent")).toBeVisible()
  await expect(cell("Afdelingsleder")).toHaveCount(0)

  await page.mouse.move(bottom.x + 40, bottom.y + bottom.height / 2)
  await expect(cell("Sagsbehandler")).toBeVisible()

  // Leaving the list altogether still releases it
  await page.mouse.move(10, 10)
  await expect(cell("Afdelingsleder")).toBeVisible()
})

test("previewing does not move the columns", async ({ page }) => {
  const fixture = await resolveFixture()

  // Values of very different widths, so an unpinned table would reflow hard
  await injectSlices(page, [
    {
      from: "2019-01-01",
      to: "2023-01-01",
      job: "Administrativ specialkonsulent i borgerservice",
      key: "A-1",
    },
    { from: "2023-01-01", to: null, job: "Chef", key: "A-2" },
  ])
  await openEngagements(page, fixture.person)

  // The table itself as well as its columns: an auto layout can make the table
  // wider than its scroll container, and pinning must not shrink it back.
  const widths = () =>
    page.evaluate(() => [
      Math.round(document.querySelector("table")!.getBoundingClientRect().width),
      ...Array.from(document.querySelectorAll("thead th")).map((th) =>
        Math.round(th.getBoundingClientRect().width)
      ),
    ])

  const same = (actual: number[], expected: number[]) => {
    expect(actual).toHaveLength(expected.length)
    for (const [i, width] of actual.entries()) {
      expect(Math.abs(width - expected[i])).toBeLessThanOrEqual(1)
    }
  }

  // Measured before anything opens, so opening the drawer is covered too
  const closed = await widths()

  await page.getByRole("button", { name: /change/ }).click()
  await expect(page.getByText("Shown above")).toBeVisible()
  same(await widths(), closed)

  await page.getByRole("button", { name: /as of 01-01-2019/ }).focus()
  await expect(
    page.getByRole("cell", { name: "Administrativ specialkonsulent i borgerservice" })
  ).toBeVisible()
  same(await widths(), closed)

  // And released again when it closes
  await page.getByRole("button", { name: /change/ }).click()
  same(await widths(), closed)
})

test("a gap is one row, with the break shown in its history", async ({ page }) => {
  const fixture = await resolveFixture()

  // Left and came back. One engagement, so one row — the break belongs in the
  // history, not in a second row carrying the same uuid and the same actions.
  await injectSlices(page, [
    { from: "2016-01-01", to: "2018-01-01", job: "Elev", key: "A-1" },
    { from: "2020-01-01", to: null, job: "Afdelingsleder", key: "A-2" },
  ])
  await openEngagements(page, fixture.person)

  // One row, showing today's values, not one row per spell
  await expect(page.getByRole("row").filter({ hasText: "A-" })).toHaveCount(1)
  await expect(
    page.getByRole("cell", { name: "Afdelingsleder", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("cell", { name: "Elev", exact: true })).toHaveCount(0)

  await page.getByRole("button", { name: /change/ }).click()

  // Each spell starts, and the stretch between them is called out
  const starts = page
    .getByRole("button", { name: /as of/ })
    .filter({ hasText: "Start" })
  await expect(starts).toHaveCount(2)
  await expect(page.getByText("Not active")).toBeVisible()
  await expect(page.getByText("01-01-2018 – 01-01-2020")).toBeVisible()

  await parkLeft(page)
  await page.screenshot({ path: "test-results/poc-gap.png", fullPage: true })
})

test("a date inside the gap is not present", async ({ page }) => {
  const fixture = await resolveFixture()

  await injectSlices(page, [
    { from: "2016-01-01", to: "2018-01-01", job: "Elev", key: "A-1" },
    { from: "2030-01-01", to: null, job: "Afdelingsleder", key: "A-2" },
  ])
  await openEngagements(page, fixture.person)

  // Today sits between the two spells: the engagement exists as a record but
  // the person is not employed, so it must not sit under Present.
  const present = page.locator("tr", { hasText: "No employments" })
  await expect(present).toHaveCount(2)
  await expect(page.getByRole("cell", { name: "Elev", exact: true })).toBeVisible()
})
