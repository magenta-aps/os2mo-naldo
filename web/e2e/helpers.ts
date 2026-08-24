import type { Page } from "@playwright/test"

const MO = process.env.MO_URL ?? "http://localhost:5000"
const GRAPHQL_VERSION = "v29"
// Locally MO fronts Keycloak on /auth; in CI Keycloak is its own service.
const KEYCLOAK = process.env.KEYCLOAK_URL ?? `${MO}/auth`

// The published defaults of the local OS2mo dev stack — not real credentials.
const CLIENT_ID = "dipex"
const CLIENT_SECRET = "603f1c82-d012-4d04-9382-dbe659c533fb"
const USER = { name: "bruce", password: "bruce" }

// Keycloak access tokens expire after minutes — shorter than the suite. A
// token cached without an expiry fails the specs that run late.
let token: { value: string; expires: number } | undefined
const moToken = async (): Promise<string> => {
  if (token && Date.now() < token.expires) return token.value
  const res = await fetch(`${KEYCLOAK}/realms/mo/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  })
  const json = await res.json()
  token = {
    value: json.access_token,
    expires: Date.now() + (json.expires_in - 30) * 1000,
  }
  return token.value
}

export const moGraphql = async (query: string, variables?: object) => {
  const res = await fetch(`${MO}/graphql/${GRAPHQL_VERSION}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await moToken()}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error("GraphQL: " + json.errors[0].message)
  return json.data
}

export type Fixture = {
  person: string
  personName: string
  unit: string
  unitName: string
  engagement: string
  from: string
}

let fixture: Promise<Fixture> | undefined
// Test objects come from the running MO, so any dataset works.
export const resolveFixture = (): Promise<Fixture> =>
  (fixture ??= moGraphql(
    "{ engagements(limit: 1) { objects { uuid validities { person { uuid name } org_unit { uuid name } validity { from } } } } }"
  ).then((data) => {
    const engagement = data.engagements.objects[0]
    const row = engagement.validities[0]
    return {
      engagement: engagement.uuid,
      person: row.person[0].uuid,
      personName: row.person[0].name.split(" ")[0],
      unit: row.org_unit[0].uuid,
      unitName: row.org_unit[0].name,
      from: row.validity.from.split("T")[0],
    }
  }))

// One editable object per detail type AND owner side, with the owner uuid
// and start date the edit route needs. The seed guarantees one of each on
// the fixture person/unit, so resolution is a single owner-filtered query
// per pair; a missing pair resolves to undefined and its smoke test skips.
export type EditTarget = { uuid: string; owner: string; from: string }
export type EditTargets = Partial<
  Record<string, { person?: EditTarget; unit?: EditTarget }>
>

const EDIT_SIDES: Record<string, { collection: string; sides: ("person" | "unit")[] }> =
  {
    address: { collection: "addresses", sides: ["person", "unit"] },
    ituser: { collection: "itusers", sides: ["person", "unit"] },
    manager: { collection: "managers", sides: ["person", "unit"] },
    association: { collection: "associations", sides: ["person", "unit"] },
    // A rolebinding's owner side is its ituser's.
    rolebinding: { collection: "rolebindings", sides: ["person", "unit"] },
    leave: { collection: "leaves", sides: ["person"] },
    kle: { collection: "kles", sides: ["unit"] },
    owner: { collection: "owners", sides: ["unit"] },
  }

let editTargets: Promise<EditTargets> | undefined
export const resolveEditTargets = (): Promise<EditTargets> =>
  (editTargets ??= (async () => {
    const fixture = await resolveFixture()
    const targets: EditTargets = {}
    for (const [type, { collection, sides }] of Object.entries(EDIT_SIDES)) {
      for (const side of sides) {
        const owner = side === "person" ? fixture.person : fixture.unit
        const filterKey = side === "person" ? "employees" : "org_units"
        const filter =
          type === "rolebinding"
            ? `ituser: { ${filterKey}: $owner }`
            : `${filterKey}: $owner`
        const data = await moGraphql(
          `query ($owner: [UUID!]) { ${collection}(filter: { ${filter} }, limit: 1) { objects { uuid validities { validity { from } } } } }`,
          { owner: [owner] }
        ).catch(() => null)
        const match = data?.[collection]?.objects?.[0]
        if (!match) continue
        ;(targets[type] ??= {})[side] = {
          uuid: match.uuid,
          owner,
          from: match.validities[0].validity.from.split("T")[0],
        }
      }
    }
    return targets
  })())

export const login = async (page: Page) => {
  const username = page.locator("#username")
  const firstQuery = () =>
    page.waitForResponse(
      (r) => r.url().includes("/graphql/") && r.request().method() === "POST" && r.ok(),
      { timeout: 30_000 }
    )
  // The app renders its shell (navbar included) BEFORE auth and only then
  // bounces to Keycloak, so seeing the shell proves nothing. A session is
  // proven either by the login form appearing (fill it) or by the app's
  // first GraphQL response — queries only fire once a token is held.
  const outcome = await Promise.race([
    username.waitFor({ timeout: 30_000 }).then(() => "form"),
    firstQuery().then(() => "session"),
  ]).catch(() => "form")
  if (outcome === "form" && (await username.isVisible())) {
    await page.fill("#username", USER.name)
    await page.fill("#password", USER.password)
    await page.click("#kc-login")
    await firstQuery()
  }
  // A page frozen during hydration must fail here, not pass vacuously.
  await page.locator(".navbar input[type=date]").waitFor({ timeout: 30_000 })
}

// Blocks every GraphQL mutation from the page, so forms can never write to
// MO. `onMutation` receives the variables a blocked mutation would have sent.
export const blockMutations = async (
  page: Page,
  onMutation?: (variables: unknown) => void
) => {
  await page.route("**/graphql/**", async (route) => {
    try {
      const body = route.request().postData()
      const post = body ? JSON.parse(body) : null
      if (post?.query?.trimStart().startsWith("mutation")) {
        onMutation?.(post.variables)
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: null, errors: [{ message: "blocked by e2e" }] }),
        })
      }
    } catch {
      /* not JSON — let it through */
    }
    return route.continue()
  })
}

export const trackPageErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message.split("\n")[0]))
  return errors
}

// Close any open dropdown so it cannot cover the next control.
export const dismiss = async (page: Page) => {
  await page.keyboard.press("Escape").catch(() => {})
  await page
    .locator("h3")
    .first()
    .click({ timeout: 1000 })
    .catch(() => {})
  await page.waitForTimeout(150)
}

// Opens the nth Select in the form and returns its option texts.
export const selectOptions = async (page: Page, nth = 0): Promise<string[]> => {
  await page.locator(`form #select >> nth=${nth}`).click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  const texts = await page.locator(".list-item").allInnerTexts()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(200)
  return texts.map((text) => text.trim())
}

// Opens the nth Select and picks its first option.
export const pickFirstOption = async (page: Page, nth = 0) => {
  await page.locator(`form #select >> nth=${nth}`).click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(300)
}

// Types into the form's Search field and picks the first result.
export const searchAndPick = async (page: Page, text: string) => {
  await page.locator("form input[type=text]").first().fill(text)
  await page.locator(".list-item").first().waitFor({ timeout: 15000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(500)
}
