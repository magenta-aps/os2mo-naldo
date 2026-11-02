import { expect, type Page, type Request } from "@playwright/test"

const MO = process.env.MO_URL ?? "http://localhost:5000"
const GRAPHQL_VERSION = "v29"
// Locally MO fronts Keycloak on /auth; in CI Keycloak is its own service.
const KEYCLOAK = process.env.KEYCLOAK_URL ?? `${MO}/auth`

// The published defaults of the local OS2mo dev stack, not real credentials.
const CLIENT_ID = "dipex"
const CLIENT_SECRET = "603f1c82-d012-4d04-9382-dbe659c533fb"
const USER = { name: "bruce", password: "bruce" }

// Keycloak access tokens expire after minutes, shorter than the suite. A
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

// The day `offset` days from today in Copenhagen, as the date inputs take it.
export const isoDay = (offset = 0) =>
  new Date(Date.now() + offset * 86_400_000).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Copenhagen",
  })

export const createInMo = async (
  type: string,
  inputType: string,
  input: object
): Promise<string> =>
  (
    await moGraphql(
      `mutation ($input: ${inputType}!) { ${type}_create(input: $input) { uuid } }`,
      { input }
    )
  )[`${type}_create`].uuid

export const deleteInMo = (type: string, uuid: string) =>
  moGraphql(`mutation ($uuid: UUID!) { ${type}_delete(uuid: $uuid) { uuid } }`, {
    uuid,
  })

export const facetUuid = async (userKey: string): Promise<string> =>
  (
    await moGraphql(
      "query ($keys: [String!]) { facets(filter: { user_keys: $keys }) { objects { uuid } } }",
      { keys: [userKey] }
    )
  ).facets.objects[0].uuid

export const firstClassUuid = async (facetUserKey: string): Promise<string> =>
  (
    await moGraphql(
      "query ($keys: [String!]) { classes(filter: { facet: { user_keys: $keys } }, limit: 1) { objects { uuid } } }",
      { keys: [facetUserKey] }
    )
  ).classes.objects[0].uuid

// A short random tag, so probe objects from parallel or crashed runs differ.
export const probeTag = () => Math.random().toString(36).slice(2, 8)

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

// The app picks its primary class by PUBLIC_PRIMARY_CLASS_USER_KEY, which CI
// sets for this process too.
const PRIMARY_CLASS_USER_KEY = process.env.PUBLIC_PRIMARY_CLASS_USER_KEY ?? "primary"

export type ClassRef = { uuid: string; name: string }

export const resolvePrimaryClass = async (): Promise<ClassRef> => {
  const data = await moGraphql(
    'query ($key: [String!]) { classes(filter: { facet: { user_keys: "primary_type" }, user_keys: $key }) { objects { uuid current { name } } } }',
    { key: [PRIMARY_CLASS_USER_KEY] }
  )
  const cls = data.classes.objects[0]
  if (!cls)
    throw new Error(
      `no primary_type class "${PRIMARY_CLASS_USER_KEY}" — run e2e/seed.cjs`
    )
  return { uuid: cls.uuid, name: cls.current.name }
}

// One editable object per detail type AND owner side, with the owner uuid
// and start date the edit route needs. The seed guarantees one of each on
// the fixture person/unit, so resolution is a single owner-filtered query
// per pair; a missing pair resolves to undefined and its smoke test skips.
export type EditTarget = { uuid: string; owner: string; from: string }
export type EditTargets = Partial<
  Record<string, { person?: EditTarget; unit?: EditTarget }>
>

export const EDIT_SIDES: Record<
  string,
  { collection: string; sides: ("person" | "unit")[] }
> = {
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
  // first GraphQL response: queries only fire once a token is held.
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

type GraphqlTraffic = { inFlight: number; lastChange: number }
const traffic = new WeakMap<Page, GraphqlTraffic>()

const trackGraphql = (page: Page) => {
  const state: GraphqlTraffic = { inFlight: 0, lastChange: Date.now() }
  traffic.set(page, state)
  const isGraphql = (request: Request) => request.url().includes("/graphql/")
  const change = (delta: number) => (request: Request) => {
    if (!isGraphql(request)) return
    state.inFlight += delta
    state.lastChange = Date.now()
  }
  page.on("request", change(1))
  page.on("requestfinished", change(-1))
  page.on("requestfailed", change(-1))
}

// Resolves once no GraphQL request has been in flight for `quietMs`, counted
// from the call at the earliest. The forms start their option refetches in the
// same tick as the change that causes them, so the quiet window catches them
// starting as well as finishing.
export const graphqlIdle = async (page: Page, quietMs = 300) => {
  const state = traffic.get(page)
  if (!state) throw new Error("graphqlIdle needs blockMutations on the page first")
  const since = Date.now()
  await expect
    .poll(
      () =>
        state.inFlight === 0 &&
        Date.now() - Math.max(state.lastChange, since) >= quietMs,
      { message: "GraphQL requests still in flight", timeout: 30_000, intervals: [50] }
    )
    .toBe(true)
}

// svelte-select closes its list and reports the change in one deferred tick,
// so once the list is gone the form has seen the pick.
export const listClosed = (page: Page) =>
  expect(page.locator(".svelte-select-list")).toHaveCount(0)

// Blocks every GraphQL mutation from the page, so forms can never write to
// MO. `onMutation` receives the variables a blocked mutation would have sent.
// Every spec sets this up before navigating, so it also starts the traffic
// tracking `graphqlIdle` reads.
export const blockMutations = async (
  page: Page,
  onMutation?: (variables: unknown) => void
) => {
  trackGraphql(page)
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
      /* not JSON, let it through */
    }
    return route.continue()
  })
}

// Submits the form and resolves once it has decided. The forms post their
// SvelteKit action first and only send the mutation from its callback, after
// their own validation, so once the action has answered and GraphQL has gone
// quiet, a mutation the form was going to send has been sent. This is what
// lets a test assert that a blocked submit sent nothing.
export const submitForm = async (page: Page) => {
  const action = page.waitForResponse(
    (r) => r.request().headers()["x-sveltekit-action"] === "true"
  )
  await page.locator("form button[type=submit]").click()
  await action
  await graphqlIdle(page)
}

// Also logs both kinds of error as they happen: a test that times out waiting
// for the page never reaches its `errors` assertion, and MO answers a failed
// query with a 200 and an `errors` list, which no page error reports.
export const trackPageErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on("pageerror", (error) => {
    const message = error.message.split("\n")[0]
    console.log(`Page error: ${message}`)
    errors.push(message)
  })
  page.on("response", async (response) => {
    if (!response.url().includes("/graphql/")) return
    const body = await response.json().catch(() => null)
    for (const error of body?.errors ?? [])
      console.log(`GraphQL error: ${error.message}`)
  })
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
  await listClosed(page)
}

// The Select of one form field, found by its label rather than its position,
// so adding a field to a form cannot shift which one a test opens. Matched by
// suffix: the wizard prefixes ids with "{entityKey}-{index}-", the routes
// don't. Hidden wizard tabs are skipped.
export const selectFor = (page: Page, field: string) =>
  page
    .locator("form .form-control", { has: page.locator(`label[for$="${field}"]`) })
    .locator("#select:visible")

// Opens a field's Select and returns its option texts.
export const selectOptions = async (page: Page, field: string): Promise<string[]> => {
  await selectFor(page, field).click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  const texts = await page.locator(".list-item").allInnerTexts()
  await page.keyboard.press("Escape")
  await listClosed(page)
  return texts.map((text) => text.trim())
}

// After a pick: the form has seen it, and whatever it refetched in response
// has landed, so the next control shows current options.
const picked = async (page: Page) => {
  await listClosed(page)
  await graphqlIdle(page)
}

// Opens a field's Select and picks its first option.
export const pickFirstOption = async (page: Page, field: string) => {
  await selectFor(page, field).click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await picked(page)
}

// SelectMultiple has no #select wrapper; target its inner input by the id
// the form gave the component. Matched by suffix: the wizard prefixes ids
// with "{entityKey}-{index}-", the routes don't.
export const pickMultiFirstOption = async (page: Page, idSuffix: string) => {
  const input = page.locator(`form input[id$="${idSuffix}"]:visible`)
  // A `has` locator is matched inside the outer element, so the form scope
  // goes on the outer one.
  const chosen = page
    .locator("form .svelte-select", {
      has: page.locator(`input[id$="${idSuffix}"]:visible`),
    })
    .locator(".multi-item")
  const before = await chosen.count()
  await input.click({ timeout: 8000 })
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(chosen).toHaveCount(before + 1)
  // Closing the list is harmless if svelte-select already did.
  await page.keyboard.press("Escape")
  await picked(page)
}

// Types into the select to filter, then picks the first match, for options
// that must be a specific one (pickFirstOption takes whatever comes first).
export const pickOptionByText = async (page: Page, field: string, text: string) => {
  await selectFor(page, field).click({ timeout: 8000 })
  await page.keyboard.type(text)
  await page.locator(".list-item").first().waitFor({ timeout: 8000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await picked(page)
}

// Picks the option named exactly `text`, for options whose names contain one
// another ("Primær" and "Ikke-primær").
export const pickExactOption = async (page: Page, field: string, text: string) => {
  await selectFor(page, field).click({ timeout: 8000 })
  await page
    .locator(".list-item")
    .filter({ has: page.getByText(text, { exact: true }) })
    .first()
    .click({ timeout: 8000 })
  await picked(page)
}

// Types into the form's Search field and picks the first result.
export const searchAndPick = async (page: Page, text: string) => {
  await page.locator("form input[type=text]:visible").first().fill(text)
  await page.locator(".list-item").first().waitFor({ timeout: 15000 })
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await picked(page)
}
