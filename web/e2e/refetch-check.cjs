// Asserts that date-driven option refetching actually works: a class that is
// only valid in the near future must appear in a form's select when the
// GLOBAL date picker (navbar) moves into its validity, and vanish when the
// date moves back. This exercises the real user flow: forms seed their start
// date from the global date store at load.
//
// The probe class is created and deleted through the API (the form itself
// never mutates anything). See e2e/README.md for prerequisites.
// Usage: node e2e/refetch-check.cjs [--headed]
const { chromium } = require("@playwright/test")
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)
setTimeout(() => {
  console.log("GLOBAL TIMEOUT")
  process.exit(2)
}, 120000)

const MO = "http://localhost:5000"
const APP = "http://localhost:5173"
const PROBE_NAME = "Refetch Probe"
// Near future: far enough that no fixture class starts in between, close
// enough to stay realistic.
const FUTURE = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0]

const getToken = async () =>
  (
    await (
      await fetch(`${MO}/auth/realms/mo/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=dipex&client_secret=603f1c82-d012-4d04-9382-dbe659c533fb",
      })
    ).json()
  ).access_token

const gq = async (token, query, variables) => {
  const res = await (
    await fetch(`${MO}/graphql/v29`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables }),
    })
  ).json()
  if (res.errors) throw new Error("GraphQL: " + res.errors[0].message)
  return res.data
}

;(async () => {
  const token = await getToken()

  // resolve a person for the form route
  const fx = await gq(
    token,
    "{ engagements(limit: 1) { objects { validities { person { uuid } } } } }"
  )
  const person = fx.engagements.objects[0].validities[0].person[0].uuid

  // seed the probe class: a job function valid only from 2050
  const facet = (
    await gq(
      token,
      '{ facets(filter: { user_keys: "engagement_job_function" }) { objects { current { uuid } } } }'
    )
  ).facets.objects[0].current.uuid
  const probe = (
    await gq(
      token,
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
  log("probe class created:", probe)

  const cleanup = async () => {
    await gq(token, "mutation ($uuid: UUID!) { class_delete(uuid: $uuid) { uuid } }", {
      uuid: probe,
    }).then(
      () => log("probe class deleted"),
      (e) => log("CLEANUP FAILED — delete manually:", probe, e.message)
    )
  }

  const browser = await chromium.launch(
    process.argv.includes("--headed")
      ? { headless: false, slowMo: 300 }
      : { args: ["--no-sandbox"] }
  )
  const failures = []
  try {
    const page = await (await browser.newContext()).newPage()
    // safety: the form must never mutate
    await page.route("**/graphql/**", async (route) => {
      try {
        const body = route.request().postData()
        if (body && JSON.parse(body).query?.trimStart().startsWith("mutation")) {
          return await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: null,
              errors: [{ message: "blocked by refetch-check" }],
            }),
          })
        }
      } catch (e) {}
      return route.continue()
    })

    await page.goto(`${APP}/employee/${person}/create/engagement`, {
      waitUntil: "domcontentloaded",
    })
    await page.waitForTimeout(2000)
    if (page.url().includes("auth")) {
      await page.fill("#username", "bruce")
      await page.fill("#password", "bruce")
      await page.click("#kc-login")
      await page.waitForTimeout(2500)
    }

    // SPA navigation via an injected anchor click: the global date store is
    // not persisted, so a full page load would reset it — exactly like a real
    // user, we have to navigate within the app.
    const spaNav = async (path) => {
      await page.evaluate((href) => {
        const a = document.createElement("a")
        a.href = href
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, path)
      await page.waitForTimeout(1200)
    }

    // Sets the GLOBAL date picker (debounced into the $date store), then
    // re-enters the form via SPA navigation so it seeds its start date from
    // the new global date — the same flow a user follows.
    const setGlobalDate = async (value) => {
      await page.locator(".navbar input[type=date]").fill(value)
      await page.waitForTimeout(900) // the navbar debounces 500ms into $date
      await spaNav(`/employee/${person}`)
      await spaNav(`/employee/${person}/create/engagement`)
      // Wait until the form actually seeded from the new global date, then
      // give the class refetch a moment to land — fixed waits alone are flaky.
      await page.waitForFunction(
        (expected) =>
          document.querySelector("form input[type=date]")?.value === expected,
        value,
        { timeout: 10000 }
      )
      await page.waitForTimeout(1500)
    }
    // Opens the job-function select and returns its option texts.
    const jobFunctionOptions = async () => {
      await page.locator("form #select").first().click({ timeout: 8000 })
      await page.locator(".list-item").first().waitFor({ timeout: 8000 })
      const texts = await page.locator(".list-item").allInnerTexts()
      await page.keyboard.press("Escape")
      await page.waitForTimeout(200)
      return texts.map((t) => t.trim())
    }
    const check = (label, options, shouldContain) => {
      const has = options.some((t) => t.includes(PROBE_NAME))
      const ok = has === shouldContain
      log(
        ok ? "PASS" : "FAIL",
        label,
        `— probe ${has ? "present" : "absent"} (${options.length} options)`
      )
      if (!ok) failures.push(label)
    }

    // Actually PICKS the probe class in the job-function select and returns
    // the uuid the form would post (the Select's hidden input).
    const pickProbe = async () => {
      await page.locator("form #select").first().click({ timeout: 8000 })
      await page
        .locator(`.list-item:has-text("${PROBE_NAME}")`)
        .first()
        .click({ timeout: 8000 })
      await page.waitForTimeout(400)
      // The hidden input is removed entirely when nothing is selected, so a
      // missing element reads as "" after a short timeout.
      return page
        .locator("form input[name=job-function]")
        .inputValue({ timeout: 3000 })
        .catch(() => "")
    }
    const assertEq = (label, actual, expected) => {
      const ok = actual === expected
      log(
        ok ? "PASS" : "FAIL",
        label,
        ok
          ? ""
          : `— expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      )
      if (!ok) failures.push(label)
    }

    const today = new Date().toISOString().split("T")[0]

    check("today: probe class must be absent", await jobFunctionOptions(), false)

    await setGlobalDate(FUTURE)
    check(
      `global date ${FUTURE}: probe class must appear`,
      await jobFunctionOptions(),
      true
    )

    // Pick it: the form must be able to submit the future class's uuid.
    assertEq("picking the probe posts its uuid", await pickProbe(), probe)

    // Move the form's own start date back (in place, no navigation): the
    // options refetch without the probe, and the Select must CLEAR the now
    // stale selection — the browser-only clearing contract the jsdom
    // component tests cannot pin.
    await page.locator("form input[type=date]").first().fill(today)
    await page.waitForTimeout(2000)
    assertEq(
      "moving the date back clears the stale selection",
      await page
        .locator("form input[name=job-function]")
        .inputValue({ timeout: 3000 })
        .catch(() => ""),
      ""
    )

    await setGlobalDate(today)
    check("back to today: probe class must vanish", await jobFunctionOptions(), false)
  } finally {
    await cleanup()
    await browser.close().catch(() => {})
  }

  log(failures.length ? `FAILED: ${failures.join("; ")}` : "all refetch checks passed")
  process.exit(failures.length ? 1 : 0)
})().catch((e) => {
  console.error("FAILED:", e.message.split("\n")[0])
  process.exit(1)
})
