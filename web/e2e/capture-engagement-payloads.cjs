// Drives the engagement forms identically and captures the mutation payload
// each would send, WITHOUT letting the mutation reach MO. See e2e/README.md.
// Usage: node e2e/capture-engagement-payloads.cjs <label> [--headed]
// Writes the captured payloads to ./payloads-<label>.json
const { chromium } = require("@playwright/test")
const fs = require("fs")
const OUT = "payloads-" + (process.argv[2] || "run") + ".json"
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)
setTimeout(() => {
  console.log("GLOBAL TIMEOUT")
  process.exit(2)
}, 170000)

// Fixture objects are resolved from the running MO at startup, so the harness
// survives dataset swaps.
let PERSON, UNIT, ENGAGEMENT, FROM, PERSON_TEXT, UNIT_TEXT
const resolveFixture = async () => {
  const tok = await (
    await fetch("http://localhost:5000/auth/realms/mo/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=dipex&client_secret=603f1c82-d012-4d04-9382-dbe659c533fb",
    })
  ).json()
  const res = await (
    await fetch("http://localhost:5000/graphql/v29", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tok.access_token,
      },
      body: JSON.stringify({
        query:
          "{ engagements(limit: 1) { objects { uuid validities { person { uuid name } org_unit { uuid name } validity { from } } } } }",
      }),
    })
  ).json()
  const v = res.data.engagements.objects[0]
  ENGAGEMENT = v.uuid
  PERSON = v.validities[0].person[0].uuid
  PERSON_TEXT = v.validities[0].person[0].name.split(" ")[0]
  UNIT = v.validities[0].org_unit[0].uuid
  UNIT_TEXT = v.validities[0].org_unit[0].name
  FROM = v.validities[0].validity.from.split("T")[0]
  log(
    "fixture:",
    PERSON_TEXT,
    "/",
    UNIT_TEXT,
    "/",
    ENGAGEMENT.slice(0, 8),
    "from",
    FROM
  )
}

;(async () => {
  await resolveFixture()
  const browser = await chromium.launch(
    process.argv.includes("--headed")
      ? { headless: false, slowMo: 300 }
      : { args: ["--no-sandbox"] }
  )
  const page = await (await browser.newContext()).newPage()
  const captured = {}
  let scenario = ""
  page.on("pageerror", (e) => log("PAGEERROR:", e.message.slice(0, 200)))

  await page.route("**/graphql/**", async (route) => {
    try {
      const body = route.request().postData()
      const post = body ? JSON.parse(body) : null
      const q = post?.query || ""
      if (q.includes("engagement_create") || q.includes("engagement_update")) {
        captured[scenario] = post.variables
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: null,
            errors: [{ message: "intercepted by test" }],
          }),
        })
      }
    } catch (e) {
      /* fall through */
    }
    return route.continue()
  })

  const login = async () => {
    if (page.url().includes("auth")) {
      await page.fill("#username", "bruce")
      await page.fill("#password", "bruce")
      await page.click("#kc-login")
      await page.waitForTimeout(3000)
    }
  }
  const pickFirst = async (selector) => {
    await page.locator(selector).click()
    await page.locator(".list-item").first().waitFor({ timeout: 15000 })
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitForTimeout(300)
  }
  const searchPick = async (text) => {
    const input = page.locator("form input[type=text]").first()
    await input.fill(text)
    await page.locator(".list-item").first().waitFor({ timeout: 15000 })
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitForTimeout(500)
  }
  const submit = async () => {
    await page.locator("form button[type=submit]").click()
    await page.waitForTimeout(1500)
  }

  // --- Scenario 1: employee create
  scenario = "employee-create"
  await page.goto(`http://localhost:5173/employee/${PERSON}/create/engagement`, {
    waitUntil: "domcontentloaded",
  })
  await page.waitForTimeout(2500)
  await login()
  await searchPick(UNIT_TEXT)
  await page.locator("form input[name=user-key]").waitFor({ timeout: 15000 })
  await page.fill("form input[name=user-key]", "E2E-TEST")
  await pickFirst("form #select >> nth=0") // job function
  await pickFirst("form #select >> nth=1") // engagement type
  await submit()
  log("employee-create:", captured["employee-create"] ? "captured" : "MISSING")

  // --- Scenario 2: org create
  scenario = "org-create"
  await page.goto(`http://localhost:5173/organisation/${UNIT}/create/engagement`, {
    waitUntil: "domcontentloaded",
  })
  await page.waitForTimeout(2500)
  await login()
  await searchPick(PERSON_TEXT)
  await page.locator("form input[name=user-key]").waitFor({ timeout: 15000 })
  await page.fill("form input[name=user-key]", "E2E-TEST")
  await pickFirst("form #select >> nth=0")
  await pickFirst("form #select >> nth=1")
  await submit()
  log("org-create:", captured["org-create"] ? "captured" : "MISSING")

  // --- Scenario 3: employee edit (change user_key only)
  scenario = "employee-edit"
  await page.goto(
    `http://localhost:5173/employee/${PERSON}/edit/engagement/${ENGAGEMENT}?from=${FROM}`,
    { waitUntil: "domcontentloaded" }
  )
  await page.waitForTimeout(2500)
  await login()
  await page.locator("form input[name=user-key]").waitFor({ timeout: 15000 })
  await page.waitForTimeout(1000)
  await page.fill("form input[name=user-key]", "E2E-EDITED")
  await page.waitForTimeout(500)
  await submit()
  log("employee-edit:", captured["employee-edit"] ? "captured" : "MISSING")

  // --- Scenario 4: org edit (change user_key only)
  scenario = "org-edit"
  await page.goto(
    `http://localhost:5173/organisation/${UNIT}/edit/engagement/${ENGAGEMENT}?from=${FROM}`,
    { waitUntil: "domcontentloaded" }
  )
  await page.waitForTimeout(2500)
  await login()
  await page.locator("form input[name=user-key]").waitFor({ timeout: 15000 })
  await page.waitForTimeout(1000)
  await page.fill("form input[name=user-key]", "E2E-EDITED")
  await page.waitForTimeout(500)
  await submit()
  log("org-edit:", captured["org-edit"] ? "captured" : "MISSING")

  fs.writeFileSync(OUT, JSON.stringify(captured, null, 2))
  log("wrote", OUT)
  await browser.close()
  process.exit(0)
})().catch((e) => {
  console.error("FAILED:", e.message.split("\n")[0])
  process.exit(1)
})
