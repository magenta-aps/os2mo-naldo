import { expect, test } from "@playwright/test"
import {
  blockMutations,
  createInMo,
  deleteInMo,
  firstClassUuid,
  isoDay,
  login,
  moGraphql,
  probeTag,
  resolveFixture,
  searchAndPick,
  submitForm,
  trackPageErrors,
  type Fixture,
} from "./helpers"

let fixture: Fixture
let source: { uuid: string; name: string }
let target: { uuid: string; name: string }
let person: { uuid: string; name: string }
let engagement: string

test.beforeAll(async () => {
  fixture = await resolveFixture()
  const [unitType, engagementType, jobFunction] = await Promise.all(
    ["org_unit_type", "engagement_type", "engagement_job_function"].map(firstClassUuid)
  )
  const tag = probeTag()
  const unit = async (name: string) => ({
    name,
    uuid: await createInMo("org_unit", "OrganisationUnitCreateInput", {
      name,
      user_key: `move-probe-${probeTag()}`,
      parent: fixture.unit,
      org_unit_type: unitType,
      validity: { from: fixture.from },
    }),
  })
  source = await unit(`Move Probe From ${tag}`)
  target = await unit(`Move Probe To ${tag}`)
  person = {
    name: `Move Probe Staff ${tag}`,
    uuid: await createInMo("employee", "EmployeeCreateInput", {
      given_name: "Move Probe",
      surname: `Staff ${tag}`,
    }),
  }
  engagement = await createInMo("engagement", "EngagementCreateInput", {
    person: person.uuid,
    org_unit: source.uuid,
    engagement_type: engagementType,
    job_function: jobFunction,
    validity: { from: fixture.from, to: isoDay(400) },
  })
})

test.afterAll(async () => {
  if (engagement) await deleteInMo("engagement", engagement)
  if (person) await deleteInMo("employee", person.uuid)
  for (const unit of [source, target].filter(Boolean))
    await deleteInMo("org_unit", unit.uuid)
})

test("moving an engagement keeps its end date", async ({ page }) => {
  const errors = trackPageErrors(page)
  const sent: any[] = []
  await blockMutations(page, (variables) => sent.push(variables))
  await page.goto("/organisation/move/engagements")
  await login(page)

  await searchAndPick(page, source.name)
  await page
    .locator("#engagement-list label", { hasText: person.name })
    .locator("input[type=checkbox]")
    .check()
  await searchAndPick(page, target.name, /Flyt til|Move to/)

  await submitForm(page)
  expect(sent, "the form must submit").toHaveLength(1)
  expect(sent[0].input).toEqual([
    expect.objectContaining({ uuid: engagement, org_unit: target.uuid }),
  ])
  const stored = (
    await moGraphql(
      "query ($uuids: [UUID!]) { engagements(filter: { uuids: $uuids }) { objects { current { validity { to } } } } }",
      { uuids: [engagement] }
    )
  ).engagements.objects[0].current.validity.to
  expect(new Date(sent[0].input[0].validity.to).getTime()).toBe(
    new Date(stored).getTime()
  )
  expect(errors).toEqual([])
})
