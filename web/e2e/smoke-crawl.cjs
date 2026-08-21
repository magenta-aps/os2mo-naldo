// Smoke-crawls the app's forms and asserts they survive being touched.
// Catches the bug classes nothing else does: reactive infinite loops (a
// frozen main thread fails the responsiveness probe), render crashes, and
// dead controls. It asserts nothing about business behavior — the payload
// harness and unit tests own that.
//
// Per form the cycle is: set the start date, open and pick every select,
// change the start date (this re-runs the option/validity refetches, where
// update loops live), then pick every select again.
//
// All GraphQL mutations are blocked at the network layer, so the crawler can
// never write to MO. See e2e/README.md for prerequisites.
// Usage: node e2e/smoke-crawl.cjs [--only <substring>] [--headed]
//   --headed opens a visible browser and slows interactions down, so you can
//   watch exactly what the crawler does to each form.
const { chromium } = require("@playwright/test")
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)
setTimeout(() => {
  console.log("GLOBAL TIMEOUT — a page probably froze harder than the probe could report")
  process.exit(2)
}, 600000)

const MO = "http://localhost:5000"
const APP = "http://localhost:5173"

const gq = async (token, query) =>
  (
    await (
      await fetch(`${MO}/graphql/v29`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      })
    ).json()
  ).data

// Resolve fixture objects so the crawl works on any dataset.
const resolveRoutes = async () => {
  const tok = await (
    await fetch(`${MO}/auth/realms/mo/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=dipex&client_secret=603f1c82-d012-4d04-9382-dbe659c533fb",
    })
  ).json()
  const data = await gq(
    tok.access_token,
    "{ engagements(limit: 1) { objects { uuid validities { person { uuid } org_unit { uuid } validity { from } } } } }"
  )
  const e = data.engagements.objects[0]
  const P = e.validities[0].person[0].uuid
  const U = e.validities[0].org_unit[0].uuid
  const FROM = e.validities[0].validity.from.split("T")[0]

  return [
    // create forms, employee side
    `/employee/${P}/create/engagement`,
    `/employee/${P}/create/address`,
    `/employee/${P}/create/ituser`,
    `/employee/${P}/create/manager`,
    `/employee/${P}/create/leave`,
    `/employee/${P}/create/association`,
    // create forms, org side
    `/organisation/${U}/create/engagement`,
    `/organisation/${U}/create/address`,
    `/organisation/${U}/create/ituser`,
    `/organisation/${U}/create/manager`,
    `/organisation/${U}/create/association`,
    `/organisation/${U}/create/kle`,
    `/organisation/${U}/create/unit`,
    // edit forms (engagement has resolved uuids; others join as needed)
    `/employee/${P}/edit/engagement/${e.uuid}?from=${FROM}`,
    `/organisation/${U}/edit/engagement/${e.uuid}?from=${FROM}`,
    // admin
    `/admin/facet`,
    `/admin/facet/create/class`,
    `/admin/itsystem/create`,
  ]
}

;(async () => {
  let routes = await resolveRoutes()
  const onlyIdx = process.argv.indexOf("--only")
  if (onlyIdx !== -1) routes = routes.filter((r) => r.includes(process.argv[onlyIdx + 1]))
  const HEADED = process.argv.includes("--headed")
  const launchOpts = HEADED
    ? { headless: false, slowMo: 300 }
    : { args: ["--no-sandbox"] }
  let browser = await chromium.launch(launchOpts)
  const results = []
  let pageErrors = []
  let page

  // A dead (frozen) page cannot be reused, so page creation is a factory:
  // fresh context, error listener, and the mutation blocker that makes the
  // crawler unable to write to MO.
  const freshPage = async () => {
    // A hard freeze (busy-looped renderer) can take the whole browser down —
    // relaunch it when the old one is gone.
    let ctx
    try {
      ctx = await browser.newContext()
    } catch (e) {
      // The old browser is gone or wedged: SIGKILL its process so a
      // busy-looped renderer cannot outlive the crawl, then relaunch.
      try {
        browser.process()?.kill("SIGKILL")
      } catch (e2) {}
      browser = await chromium.launch(launchOpts)
      ctx = await browser.newContext()
    }
    const p = await ctx.newPage()
    p.on("pageerror", (err) => pageErrors.push(err.message.split("\n")[0]))
    await p.route("**/graphql/**", async (route) => {
      try {
        const body = route.request().postData()
        if (body && JSON.parse(body).query?.trimStart().startsWith("mutation")) {
          return await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: null, errors: [{ message: "blocked by smoke-crawl" }] }),
          })
        }
      } catch (e) {
        /* fall through */
      }
      return route.continue()
    })
    return p
  }
  page = await freshPage()

  // Interactions that are not actionability-gated (keyboard presses) have NO
  // default timeout in Playwright — on a frozen renderer they await forever.
  // Everything the crawler awaits against the page goes through a deadline.
  const withDeadline = (promise, ms, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`DEADLINE ${ms}ms: ${label}`)), ms)
      ),
    ])

  // The freeze detector: a wedged main thread cannot answer this.
  const probe = async (step) => {
    const alive = await Promise.race([
      page.evaluate(() => 1).then(() => true),
      new Promise((r) => setTimeout(() => r(false), 3000)),
    ])
    if (!alive) throw new Error(`FROZEN at: ${step}`)
  }

  const login = async () => {
    if (page.url().includes("auth")) {
      await page.fill("#username", "bruce")
      await page.fill("#password", "bruce")
      await page.click("#kc-login")
      await page.waitForTimeout(2500)
    }
  }

  // Close any open dropdown/overlay so it cannot cover the next control.
  const dismiss = async () => {
    await withDeadline(page.keyboard.press("Escape"), 5000, "dismiss").catch(() => {})
    await page.locator("h3").first().click({ timeout: 1000 }).catch(() => {})
    await page.waitForTimeout(150)
  }

  const setStartDate = async (value) => {
    const from = page.locator("form input[type=date]").first()
    if ((await from.count()) === 0) return
    await dismiss()
    await from.fill(value, { timeout: 8000 })
    await page.waitForTimeout(600) // let refetches fire
  }

  const pickAllSelects = async (step) => {
    const n = await page.locator("form #select").count()
    for (let i = 0; i < n; i++) {
      await dismiss()
      try {
        // One retry: a stale overlay can cover the control.
        try {
          await page.locator(`form #select >> nth=${i}`).click({ timeout: 6000 })
        } catch (e) {
          await dismiss()
          await page.locator(`form #select >> nth=${i}`).click({ timeout: 6000 })
        }
      } catch (e) {
        // Selects can legitimately appear/disappear as picks and date changes
        // re-gate parts of the form. An unclickable select on an ALIVE page is
        // a warning, not a dead page — the probe decides which one it is.
        await probe(`${step}: select ${i} unclickable`)
        log("  warn:", `${step}: select ${i} not clickable — skipped`)
        continue
      }
      await probe(`${step}: opened select ${i}`)
      const gotItems = await page
        .locator(".list-item")
        .first()
        .waitFor({ timeout: 2500 })
        .then(() => true)
        .catch(() => false)
      if (gotItems) {
        await withDeadline(page.keyboard.press("ArrowDown"), 5000, `${step}: ArrowDown select ${i}`)
        await withDeadline(page.keyboard.press("Enter"), 5000, `${step}: Enter select ${i}`)
      } else {
        await withDeadline(page.keyboard.press("Escape"), 5000, `${step}: Escape select ${i}`)
      }
      await page.waitForTimeout(300)
      await probe(`${step}: picked select ${i}`)
    }
    return n
  }

  let sawDead = false
  const today = new Date()
  const iso = (d) => d.toISOString().split("T")[0]
  const date1 = iso(today)
  const date2 = iso(new Date(today.getTime() + 40 * 86400000))

  for (const route of routes) {
    pageErrors = []
    const t0 = Date.now()
    try {
      await page.goto(APP + route, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(2000)
      await login()
      await probe("initial render")

      await setStartDate(date1)
      await probe("set start date")
      const selects = await pickAllSelects("first pass")

      await setStartDate(date2)
      await probe("changed start date")
      await pickAllSelects("second pass")

      // touch the text inputs too
      await dismiss()
      const texts = page.locator("form input[type=text]:not([readonly])")
      const tn = await texts.count()
      for (let i = 0; i < tn; i++) {
        await texts.nth(i).fill("smoke", { timeout: 4000 }).catch(() => {})
      }
      await probe("filled text inputs")

      const errs = [...new Set(pageErrors)]
      results.push({
        route,
        ok: errs.length === 0,
        selects,
        ms: Date.now() - t0,
        errors: errs,
      })
      log(errs.length === 0 ? "OK    " : "ERRORS", route, `(${selects} selects, ${Date.now() - t0}ms)`)
      for (const e of errs) log("        pageerror:", e.slice(0, 140))
    } catch (err) {
      sawDead = true
      results.push({ route, ok: false, ms: Date.now() - t0, errors: [err.message.split("\n")[0]] })
      log("DEAD  ", route, "—", err.message.split("\n")[0])
      // A frozen page cannot be reused — and closing a context whose
      // renderer is spinning may itself never resolve, so give up on it
      // after a short grace period and just open a fresh one (freshPage
      // relaunches the browser if the freeze took it down entirely).
      await Promise.race([
        page.context().close().catch(() => {}),
        new Promise((r) => setTimeout(r, 3000)),
      ])
      page = await freshPage()
    }
  }

  const failed = results.filter((r) => !r.ok)
  // Graceful teardown is not reliable after a renderer has been wedged —
  // playwright's exit hooks can block the event loop reaping it. Write the
  // verdict synchronously, kill our browser process, then SIGKILL ourselves.
  // The exit code is 1 on any failure (SIGKILL would otherwise report 137,
  // which callers should treat the same as failure).
  const summary = [
    "",
    `=== ${results.length - failed.length}/${results.length} routes OK ===`,
    ...failed.map((f) => `FAILED: ${f.route} — ${f.errors.join(" | ")}`),
    "",
  ].join("\n")
  require("fs").writeSync(1, summary)
  if (!sawDead) {
    // Nothing wedged: a normal exit reports a proper 0/1 code.
    await Promise.race([browser.close().catch(() => {}), new Promise((r) => setTimeout(r, 3000))])
    process.exit(failed.length ? 1 : 0)
  }
  // A wedged renderer orphaned by an earlier browser kill can outlive us,
  // hold inherited pipes open, and block playwright's own exit hooks — take
  // the whole process group down. (Exit code becomes 137; callers must treat
  // any nonzero as failure.)
  try {
    browser.process()?.kill("SIGKILL")
  } catch (e) {}
  try {
    process.kill(-process.pid, "SIGKILL")
  } catch (e) {
    process.kill(process.pid, "SIGKILL")
  }
})().catch((e) => {
  console.error("CRAWL ABORTED:", e.message.split("\n")[0])
  process.exit(1)
})
