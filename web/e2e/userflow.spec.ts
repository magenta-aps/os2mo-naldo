import { expect, test } from "@playwright/test"
import {
  blockMutations,
  dismiss,
  login,
  moGraphql,
  pickFirstOption,
  pickMultiFirstOption,
  pickOptionByText,
  resolveFixture,
  searchAndPick,
  trackPageErrors,
} from "./helpers"

// Walks the onboarding wizard end to end — employee, engagement, ituser
// (incl. a rolebinding), manager, address — and submits at the summary. The
// wizard submits ONE combined UserFlowCreate mutation with client-generated
// uuids; capturing it verifies the whole store→mapper→mutation wiring,
// including the cross-references between the created objects.

// The ituser step's role select only lists roles linked to the chosen IT
// system, so the test must pick a system that has one (the seed links one).
const resolveRoleSystem = async (): Promise<string | undefined> => {
  const data = await moGraphql(
    '{ classes(filter: { facet: { user_keys: "role" } }) { objects { current { name it_system { name } } } } }'
  )
  return data.classes.objects.find((cls: any) => cls.current?.it_system)?.current
    .it_system.name
}

test("onboarding wizard submits a coherent batch", async ({ page }) => {
  // Nothing else visits /userflow, so this test can pay the dev server's
  // full cold compile of the wizard — more than the default 120s.
  test.slow()
  const fixture = await resolveFixture()
  const roleSystem = await resolveRoleSystem()
  expect(
    roleSystem,
    "no role class linked to an IT system — run e2e/seed.cjs"
  ).toBeTruthy()

  const errors = trackPageErrors(page)
  let captured: any = null
  await blockMutations(page, (variables) => (captured = variables))

  await page.goto("/userflow")
  await login(page)
  // Validation runs async before the step swaps: wait it out, or the next
  // action lands on the old step's form.
  const next = async () => {
    await page.locator('form button:has-text("Next")').click()
    await page.waitForTimeout(800)
  }

  // Step 1: employee
  await page.fill("form input[name=cpr-number]", "0101904111")
  await page.fill("form input[name=first-name]", "Smoke")
  await page.fill("form input[name=last-name]", "Testesen")
  await next()

  // Step 2: engagement — pick the fixture unit and the first class options
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, 0) // job function
  await pickFirstOption(page, 1) // engagement type
  // Second engagement on its own tab, exercising the multi-tab machinery.
  await page.locator('button[aria-label="Add engagement"]').click()
  await page.waitForTimeout(500)
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, 0)
  await pickFirstOption(page, 1)
  await next()

  // Step 3: ituser — the system with a linked role, an account name, a role.
  // Skattestyrelsen deployments pre-seed and lock the account name. Inputs
  // are matched by name suffix: the rewritten wizard prefixes ids per tab
  // ("ituser-0-account-name"), the old one doesn't.
  await pickOptionByText(page, 0, roleSystem!)
  const accountName = page.locator('form input[name$="account-name"]')
  const lockedAccount = await accountName.isDisabled()
  if (!lockedAccount) await accountName.fill("SMOKE01")
  const expectedAccount = lockedAccount ? await accountName.inputValue() : "SMOKE01"
  await pickFirstOption(page, 2) // role (0 = it system, 1 = primary)
  await next()

  // Step 4: manager
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, 0) // manager type
  await pickFirstOption(page, 1) // manager level
  await pickMultiFirstOption(page, "responsibility")
  await dismiss(page) // the multi-select leaves its list open
  await next()

  // Step 5: address — the seeded EMAIL-scope type, so the value validates
  await pickFirstOption(page, 0) // visibility
  await pickOptionByText(page, 1, "Email")
  await page.fill('form input[name$="value"]', "smoke@example.org")
  await next()

  // Summary: submit the batch
  await page.locator('button:has-text("Submit")').click()
  await page.waitForTimeout(1500)

  expect(captured, "the wizard must have submitted the combined mutation").toBeTruthy()
  const employee = captured.employeeInput
  expect(employee.given_name).toBe("Smoke")
  expect(employee.surname).toBe("Testesen")

  // Every detail must reference the employee's client-generated uuid and
  // carry what was picked on its step.
  expect(captured.engagementInput).toHaveLength(2)
  for (const engagement of captured.engagementInput) {
    expect(engagement.person).toBe(employee.uuid)
    expect(engagement.org_unit).toBe(fixture.unit)
    expect(engagement.job_function).toBeTruthy()
    expect(engagement.engagement_type).toBeTruthy()
  }

  expect(captured.ituserInput).toHaveLength(1)
  const ituser = captured.ituserInput[0]
  expect(ituser.person).toBe(employee.uuid)
  expect(ituser.itsystem).toBeTruthy()
  expect(ituser.user_key).toBe(expectedAccount)

  // The rolebinding hangs off the ituser's client-generated uuid.
  expect(captured.rolebindingInput).toHaveLength(1)
  expect(captured.rolebindingInput[0].ituser).toBe(ituser.uuid)
  expect(captured.rolebindingInput[0].role).toBeTruthy()

  expect(captured.managerInput).toHaveLength(1)
  const manager = captured.managerInput[0]
  expect(manager.person).toBe(employee.uuid)
  expect(manager.org_unit).toBe(fixture.unit)
  expect(manager.manager_type).toBeTruthy()
  expect(manager.manager_level).toBeTruthy()
  expect(manager.responsibility).not.toHaveLength(0)

  expect(captured.addressInput).toHaveLength(1)
  const address = captured.addressInput[0]
  expect(address.person).toBe(employee.uuid)
  expect(address.address_type).toBeTruthy()
  expect(address.value).toBe("smoke@example.org")

  expect(errors).toEqual([])
})
