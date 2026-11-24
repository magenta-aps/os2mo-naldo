import { expect, test, type Page } from "@playwright/test"
import {
  blockMutations,
  graphqlIdle,
  login,
  selectFor,
  trackPageErrors,
} from "./helpers"

// Only admins may read policies, and the e2e user is not one, so the tests
// answer the policy query themselves. The fields of a collection come from
// introspection, which MO allows everyone.
const POLICY_UUID = "6b2d1c7e-0000-4000-8000-00000000e2e0"

const fixture = (overrides: object = {}) => ({
  uuid: POLICY_UUID,
  name: "E2E Probe Policy",
  description: "Seeded by the e2e suite",
  active: true,
  managed: false,
  selectors: [{ kind: "role", value: "auditor" }],
  read_rules: [
    {
      collection: "Address",
      fields: ["user_key"],
      condition: "true",
      graphql_version: "VERSION_29",
    },
    {
      collection: "Address",
      fields: ["value"],
      condition: '{"uuids": [token.uuid]}',
      graphql_version: "VERSION_29",
    },
    // Unknown to the frontend's schema, so it lands in the other group
    {
      collection: "AccessLog",
      fields: ["id"],
      condition: "true",
      graphql_version: "VERSION_30",
    },
  ],
  write_rules: [
    { mutator: "address_create", condition: "true", graphql_version: "VERSION_29" },
    { mutator: "address_update", condition: "true", graphql_version: "VERSION_29" },
    { mutator: "employee_update", condition: "false", graphql_version: "VERSION_29" },
  ],
  ...overrides,
})

const servePolicy = async (page: Page, policy: object) =>
  page.route("**/graphql/**", async (route) => {
    const body = route.request().postData() ?? ""
    if (!body.includes("query Policy(")) return route.fallback()
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { policies: { objects: [policy] } } }),
    })
  })

// The form sends its mutation straight from the submit, without a SvelteKit
// action, so waiting for GraphQL to go quiet is enough.
const submit = async (page: Page) => {
  await page.locator("form button[type=submit]").click()
  await graphqlIdle(page)
}

const group = (page: Page, key: string) => page.locator(`details[data-group="${key}"]`)

// A new policy shows no collections; one is picked to grant something in, and opens
const addGroup = async (page: Page, key: string, label: RegExp) => {
  await selectFor(page, "policy-add-group").click()
  await page.locator(".list-item").filter({ hasText: label }).first().click()
  await expect(group(page, key)).toHaveAttribute("open", "")
}

test("creating a policy sends the picked roles and grants", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto("/admin/policies/create")
  await login(page)

  await page.fill("#name", "  Address auditor ")
  await page.fill("#policy-role", "auditor")
  await page.keyboard.press("Enter")

  await addGroup(page, "Address", /^\s*(Addresses|Adresser)\s*$/)
  const address = group(page, "Address")
  await address.getByRole("button", { name: /læseadgang|read access/i }).click()
  const read = address.locator('[data-grant="read"]')
  await read.getByLabel("value", { exact: true }).check()
  await read.getByLabel("user_key", { exact: true }).check()
  await address.getByRole("button", { name: /skriveadgang|write access/i }).click()
  const write = address.locator('[data-grant="write"]')
  await write.getByLabel("address_create", { exact: true }).check()
  const condition =
    '{"collection": "OrganisationUnit", "filter": {"uuids": [args.input.org_unit]}}'
  await write.locator("textarea").fill(condition)

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].uuid).toMatch(/^[0-9a-f-]{36}$/)
  expect(sent[0].state).toEqual({
    name: "Address auditor",
    description: "",
    active: true,
    selectors: [{ kind: "role", value: "auditor" }],
    read_rules: [
      {
        collection: "Address",
        fields: ["value", "user_key"],
        condition: "true",
        graphql_version: "VERSION_29",
      },
    ],
    write_rules: [
      { mutator: "address_create", condition, graphql_version: "VERSION_29" },
    ],
  })
  expect(errors).toEqual([])
})

test("an untouched form is not red, and an invalid one sends nothing", async ({
  page,
}) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto("/admin/policies/create")
  await login(page)

  await expect(page.locator(".text-error, .input-error")).toHaveCount(0)

  await addGroup(page, "Class", /^\s*(Classes|Klasser)\s*$/)
  const klass = group(page, "Class")
  await klass.getByRole("button", { name: /læseadgang|read access/i }).click()
  const read = klass.locator('[data-grant="read"]')
  await read.getByLabel("name", { exact: true }).check()
  await read.locator("textarea").fill("")
  // Close the group, so the submit has to open it to show the problem
  await klass.locator("summary").click()

  await submit(page)
  expect(sent).toEqual([])
  await expect(page.locator("#name")).toHaveClass(/input-error/)
  await expect(klass).toHaveAttribute("open", "")
  await expect(klass.locator(".text-error")).toBeVisible()
  expect(errors).toEqual([])
})

test("saving an unchanged policy sends it back as it was", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  const policy = fixture()
  await servePolicy(page, policy)
  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await login(page)
  await expect(page.locator("#name")).toHaveValue(policy.name)
  await expect(group(page, "other")).toBeVisible()

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  const { uuid, managed, ...state } = policy
  expect(sent[0]).toEqual({ uuid, state })
  expect(errors).toEqual([])
})

test("deleting a policy declares it as null", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await servePolicy(page, fixture())
  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await login(page)
  await expect(page.locator("#name")).toHaveValue("E2E Probe Policy")

  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: /slet politik|delete policy/i }).click()
  await graphqlIdle(page)
  expect(sent).toEqual([{ uuid: POLICY_UUID, state: null }])
  expect(errors).toEqual([])
})

test("a managed policy can be looked at, not changed", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await servePolicy(page, fixture({ managed: true }))
  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await login(page)

  await expect(page.locator("#name")).toBeDisabled()
  await expect(page.locator("form button[type=submit]")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: /slet politik|delete policy/i })
  ).toHaveCount(0)
  const address = group(page, "Address")
  await address.locator("summary").click()
  await expect(address.locator('input[type="checkbox"]').first()).toBeDisabled()
  await expect(address.locator("textarea").first()).toBeDisabled()
  expect(sent).toEqual([])
  expect(errors).toEqual([])
})

test("deprecated fields show only when a rule has them", async ({ page }) => {
  const errors = trackPageErrors(page)
  await blockMutations(page)
  await page.goto("/admin/policies/create")
  await login(page)

  await addGroup(page, "Address", /^\s*(Addresses|Adresser)\s*$/)
  const address = group(page, "Address")
  await address.getByRole("button", { name: /læseadgang|read access/i }).click()
  const read = address.locator('[data-grant="read"]')
  await expect(read.getByLabel("address_type_response", { exact: true })).toBeVisible()
  // Deprecated in favour of address_type_response
  await expect(read.getByLabel("address_type_uuid", { exact: true })).toHaveCount(0)
  expect(errors).toEqual([])
})

test("a condition MO cannot parse is shown on its grant", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await servePolicy(page, fixture())
  // The third write rule is the Employee grant's employee_update
  await page.route("**/graphql/**", async (route) => {
    const body = route.request().postData() ?? ""
    if (!body.includes("mutation DeclarePolicy")) return route.fallback()
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: null,
        errors: [
          {
            message:
              "Variable '$state' got invalid value 'false' at 'state.write_rules[2].condition'; Expected type 'CEL'. INVALID_ARGUMENT: ERROR: <input>:1:8: Syntax error: mismatched input [INVALID_ARGUMENT]",
          },
        ],
      }),
    })
  })
  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await login(page)
  await expect(page.locator("#name")).toHaveValue("E2E Probe Policy")

  await submit(page)
  const employee = group(page, "Employee")
  await expect(employee).toHaveAttribute("open", "")
  await expect(employee.locator('[data-grant="write"] pre')).toHaveText(
    "ERROR: <input>:1:8: Syntax error: mismatched input"
  )
  // Editing clears it until the next save
  await employee.locator('[data-grant="write"] textarea').fill("true")
  await expect(employee.locator('[data-grant="write"] pre')).toHaveCount(0)
  expect(errors).toEqual([])
})

test("copying a policy starts a new one with its rules", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  const policy = fixture({ managed: true })
  await servePolicy(page, policy)
  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await login(page)
  await page.getByRole("link", { name: /kopiér politik|copy policy/i }).click()
  await expect(page.locator("#name")).toHaveValue(/E2E Probe Policy \((copy|kopi)\)/)
  await expect(page.locator("#name")).toBeEnabled()

  await submit(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].uuid).not.toBe(POLICY_UUID)
  const { uuid, managed, ...state } = policy
  expect(sent[0].state).toEqual({
    ...state,
    name: expect.stringMatching(/\((copy|kopi)\)$/),
  })
  expect(errors).toEqual([])
})

test("a typo in a condition is pointed out, and blocks the save", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto("/admin/policies/create")
  await login(page)
  await page.fill("#name", "Typo probe")

  await addGroup(page, "Class", /^\s*(Classes|Klasser)\s*$/)
  const klass = group(page, "Class")
  await klass.getByRole("button", { name: /læseadgang|read access/i }).click()
  const read = klass.locator('[data-grant="read"]')
  // Nothing ticked yet, so the grant says it will not be saved
  await expect(read.locator("[data-empty-grant]")).toBeVisible()
  await read.getByLabel("name", { exact: true }).check()
  await expect(read.locator("[data-empty-grant]")).toHaveCount(0)
  const condition = read.locator("textarea")
  const hint = read.locator("[data-cel-syntax]")

  await condition.fill('{"uuids": [token.uuid]')
  await expect(hint).toContainText("Expected RBRACE")
  await condition.fill('{"uuids": [token.uuid]}')
  await expect(hint).toHaveCount(0)

  await condition.fill('{"uuids": [token.uuid]')
  await klass.locator("summary").click()
  await submit(page)
  expect(sent).toEqual([])
  await expect(klass).toHaveAttribute("open", "")
  await expect(hint).toContainText("Expected RBRACE")
  expect(errors).toEqual([])
})

// The e2e user is no admin, so MO refuses to show any policy
test("a user MO does not show policies to is told so", async ({ page }) => {
  const errors = trackPageErrors(page)
  await blockMutations(page)
  await page.goto("/admin/policies")
  await login(page)
  await expect(
    page.getByText(/have access to policies|ikke adgang til politikker/i)
  ).toBeVisible()

  await page.goto(`/admin/policies/${POLICY_UUID}`)
  await expect(
    page.getByText(/have access to policies|ikke adgang til politikker/i)
  ).toBeVisible()
  expect(errors).toEqual([])
})
