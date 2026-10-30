import { expect, test } from "@playwright/test"
import {
  blockMutations,
  dismiss,
  graphqlIdle,
  login,
  moGraphql,
  pickExactOption,
  pickFirstOption,
  pickMultiFirstOption,
  pickOptionByText,
  resolveFixture,
  resolvePrimaryClass,
  searchAndPick,
  trackPageErrors,
} from "./helpers"

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
  // full cold compile of the wizard, more than the default 120s.
  test.slow()
  const fixture = await resolveFixture()
  const roleSystem = await resolveRoleSystem()
  const primary = await resolvePrimaryClass()
  expect(
    roleSystem,
    "no role class linked to an IT system — run e2e/seed.cjs"
  ).toBeTruthy()

  const errors = trackPageErrors(page)
  let captured: any = null
  await blockMutations(page, (variables) => (captured = variables))

  await page.goto("/userflow")
  await login(page)
  const stepTab = (index: number) =>
    // The Stepper's tabs, not the per-entity tabs inside the form: both use
    // daisyUI's `tab`, only the Stepper's wrapper is `tabs-border`.
    page.locator(".tabs-border button.tab").nth(index)
  const onStep = async (index: number) => {
    await expect(stepTab(index)).toHaveClass(/tab-active/)
    await graphqlIdle(page)
  }
  // Validation runs async before the step swaps, and a step that fails it
  // stays put, so wait for the step itself.
  const next = async (index: number) => {
    await page.locator('form button:has-text("Next")').click()
    await onStep(index)
  }
  const submitted = async () => {
    await page.locator('button:has-text("Submit")').click()
    await expect
      .poll(() => captured, { message: "the summary must submit the batch" })
      .toBeTruthy()
  }

  // Step 1: employee
  await page.fill("form input[name=cpr-number]", "0101904111")
  await page.fill("form input[name=first-name]", "Smoke")
  await page.fill("form input[name=last-name]", "Testesen")
  await next(1)

  // Step 2: engagement, picking the fixture unit and the first class options
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "job-function")
  await pickFirstOption(page, "engagement-type")
  // Second engagement on its own tab, exercising the multi-tab machinery.
  await page.locator('button[aria-label="Add engagement"]').click()
  await expect(
    page.locator('form input[id^="engagement-1-"]:visible').first()
  ).toBeVisible()
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "job-function")
  await pickFirstOption(page, "engagement-type")
  await next(2)

  // Step 3: ituser with the system with a linked role, an account name, a role.
  // Skattestyrelsen deployments pre-seed and lock the account name. Inputs
  // are matched by name suffix: the rewritten wizard prefixes ids per tab
  // ("ituser-0-account-name"), the old one doesn't.
  await pickOptionByText(page, "it-system", roleSystem!)
  const accountName = page.locator('form input[name$="account-name"]')
  const lockedAccount = await accountName.isDisabled()
  if (!lockedAccount) await accountName.fill("SMOKE01")
  const expectedAccount = lockedAccount ? await accountName.inputValue() : "SMOKE01"
  await page.fill('form input[name$="external-id"]', "SMOKE-EXT-01")
  await pickFirstOption(page, "it-system-role-uuid")
  await next(3)

  // Step 4: manager
  await searchAndPick(page, fixture.unitName)
  await pickFirstOption(page, "manager-type")
  await pickFirstOption(page, "manager-level")
  await pickMultiFirstOption(page, "responsibility")
  await dismiss(page) // the multi-select leaves its list open
  await pickExactOption(page, "primary", primary.name)
  await next(4)

  // Step 5: address with the seeded EMAIL-scope type, so the value validates
  await pickFirstOption(page, "visibility")
  await pickOptionByText(page, "address-type", "Email")
  await page.fill('form input[name$="value"]', "smoke@example.org")
  await next(5)

  // Summary: what is submitted must first be shown.
  await expect(page.getByText("SMOKE-EXT-01")).toBeVisible()
  await submitted()
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
  expect(ituser.external_id).toBe("SMOKE-EXT-01")

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
  expect(manager.primary).toBe(primary.uuid)

  expect(captured.addressInput).toHaveLength(1)
  const address = captured.addressInput[0]
  expect(address.person).toBe(employee.uuid)
  expect(address.address_type).toBeTruthy()
  expect(address.value).toBe("smoke@example.org")

  // A Stepper jump runs no step's own validation, so a tab approved earlier
  // keeps its stamp until the summary re-stamps on entry. Clearing the first
  // engagement's start date must drop that engagement alone; the second tab
  // is untouched and stays in the batch.
  await stepTab(1).click()
  await onStep(1)
  await page.locator('form input[type=date][id$="from"]:visible').first().fill("")
  await stepTab(5).click()
  await onStep(5)

  captured = null
  await submitted()
  expect(captured.engagementInput).toHaveLength(1)
  expect(captured.engagementInput[0].org_unit).toBe(fixture.unit)

  expect(errors).toEqual([])
})
