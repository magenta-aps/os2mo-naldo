import type { Page } from "@playwright/test"
import { test } from "@playwright/test"
import fs from "fs"
import {
  blockMutations,
  login,
  pickFirstOption,
  pickMultiFirstOption,
  pickOptionByText,
  resolveFixture,
  searchAndPick,
} from "./helpers"

// Captures what the create and edit forms would submit, without letting
// the mutation reach MO. Run with PAYLOAD_LABEL=old on the baseline ref, then
// PAYLOAD_LABEL=new on the branch — the "new" run diffs against the old file.
const LABEL = process.env.PAYLOAD_LABEL
const OUT_FILE = `payloads-${LABEL}.json`

test.skip(!LABEL, "payload capture only runs with PAYLOAD_LABEL set")

// Each capture merges into the file immediately: a failed test restarts the
// worker and wipes module state, so an in-memory collect-then-write loses
// earlier scenarios.
const capture = (scenario: string) => (variables: unknown) => {
  const captured = fs.existsSync(OUT_FILE)
    ? JSON.parse(fs.readFileSync(OUT_FILE, "utf8"))
    : {}
  captured[scenario] = variables
  fs.writeFileSync(OUT_FILE, JSON.stringify(captured, null, 2))
}

const submit = async (page: Page) => {
  await page.locator("form button[type=submit]").click()
  await page.waitForTimeout(1500)
}

test("employee create", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("employee-create"))
  await page.goto(`/employee/${fixture.person}/create/engagement`)
  await login(page)
  await searchAndPick(page, fixture.unitName)
  await page.fill("form input[name=user-key]", "E2E-TEST")
  await pickFirstOption(page, 0) // job function
  await pickFirstOption(page, 1) // engagement type
  await submit(page)
})

test("org create", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("org-create"))
  await page.goto(`/organisation/${fixture.unit}/create/engagement`)
  await login(page)
  await searchAndPick(page, fixture.personName)
  await page.fill("form input[name=user-key]", "E2E-TEST")
  await pickFirstOption(page, 0)
  await pickFirstOption(page, 1)
  await submit(page)
})

test("employee edit", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("employee-edit"))
  await page.goto(
    `/employee/${fixture.person}/edit/engagement/${fixture.engagement}?from=${fixture.from}`
  )
  await login(page)
  await page.waitForTimeout(1000)
  await page.fill("form input[name=user-key]", "E2E-EDITED")
  await submit(page)
})

test("org edit", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("org-edit"))
  await page.goto(
    `/organisation/${fixture.unit}/edit/engagement/${fixture.engagement}?from=${fixture.from}`
  )
  await login(page)
  await page.waitForTimeout(1000)
  await page.fill("form input[name=user-key]", "E2E-EDITED")
  await submit(page)
})

test("employee create address", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("employee-create-address"))
  await page.goto(`/employee/${fixture.person}/create/address`)
  await login(page)
  await pickFirstOption(page, 0) // visibility
  await pickOptionByText(page, 1, "Email") // the seeded EMAIL-scope type
  await page.fill('form input[name$="value"]', "payload@example.org")
  await submit(page)
})

test("employee create ituser", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("employee-create-ituser"))
  await page.goto(`/employee/${fixture.person}/create/ituser`)
  await login(page)
  await pickFirstOption(page, 0) // it system
  await page.fill('form input[name$="account-name"]', "E2E-ACCOUNT")
  await submit(page)
})

test("employee create manager", async ({ page }) => {
  const fixture = await resolveFixture()
  await blockMutations(page, capture("employee-create-manager"))
  await page.goto(`/employee/${fixture.person}/create/manager`)
  await login(page)
  await searchAndPick(page, fixture.unitName)
  // The engagement link demands a conscious choice; opt out.
  await page.locator('form input[id$="no-engagement"]').check()
  await pickFirstOption(page, 1) // manager type (0 is the engagement select)
  await pickFirstOption(page, 2) // manager level
  await pickMultiFirstOption(page, "responsibility")
  await submit(page)
})

test("create employee", async ({ page }) => {
  await blockMutations(page, capture("create-employee"))
  await page.goto("/employee/create/employee")
  await login(page)
  await page.fill("form input[name=cpr-number]", "0101904111")
  await page.fill("form input[name=first-name]", "Payload")
  await page.fill("form input[name=last-name]", "Testesen")
  await submit(page)
})

test.afterAll(() => {
  if (!LABEL) return
  // A "new" run diffs itself against an existing payloads-old.json.
  if (LABEL !== "new" || !fs.existsSync("payloads-old.json")) return
  const captured = fs.existsSync(OUT_FILE)
    ? JSON.parse(fs.readFileSync(OUT_FILE, "utf8"))
    : {}
  const old = JSON.parse(fs.readFileSync("payloads-old.json", "utf8"))
  let differs = false
  for (const key of new Set([...Object.keys(old), ...Object.keys(captured)])) {
    if (JSON.stringify(old[key]) === JSON.stringify(captured[key])) {
      console.log(key, "=> IDENTICAL")
      continue
    }
    differs = true
    console.log(key, "=> DIFFERS")
    const oldInput = old[key]?.input ?? {}
    const newInput = (captured[key] as any)?.input ?? {}
    for (const field of new Set([...Object.keys(oldInput), ...Object.keys(newInput)])) {
      if (JSON.stringify(oldInput[field]) !== JSON.stringify(newInput[field]))
        console.log(
          `   ${field}:`,
          JSON.stringify(oldInput[field]),
          "->",
          JSON.stringify(newInput[field])
        )
    }
  }
  console.log(
    differs
      ? "payloads DIFFER — must be deliberate, call it out in the MR"
      : "payloads identical"
  )
})
