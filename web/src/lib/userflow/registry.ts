import type { ComponentType } from "svelte"
import { derived, readable, type Readable } from "svelte/store"
import { stepConfigs, type StepConfig } from "$lib/userflow/stepIds"
import EmployeeStep from "$lib/components/userflow/EmployeeStep.svelte"
import EngagementStep from "$lib/components/userflow/EngagementStep.svelte"
import ItuserStep from "$lib/components/userflow/ItuserStep.svelte"
import ManagerStep from "$lib/components/userflow/ManagerStep.svelte"
import AddressStep from "$lib/components/userflow/AddressStep.svelte"
import SummaryStep from "$lib/components/userflow/SummaryStep.svelte"
import { employeeInfo } from "$lib/stores/employeeInfoStore"
import { engagementInfo } from "$lib/stores/engagementInfoStore"
import { ituserInfo } from "$lib/stores/ituserInfoStore"
import { managerInfo } from "$lib/stores/managerInfoStore"
import { addressInfo } from "$lib/stores/addressInfoStore"
import type { Validatable } from "$lib/stores/createStepStore"

export type StepDefinition = StepConfig & {
  component: ComponentType
  // Drives the Stepper's checkmark; undefined until the step is visited.
  valid: Readable<boolean | undefined>
}

const singleValid = (store: Readable<Validatable>) =>
  derived(store, (item) => item.validated)

const multiValid = (store: Readable<Validatable[]>) =>
  derived(store, (items) =>
    items.some((item) => item.validated !== undefined)
      ? items.every((item) => item.validated)
      : undefined
  )

// The summary has no data of its own, so no checkmark.
const never: Readable<boolean | undefined> = readable(undefined)

const wiring: Record<
  StepConfig["id"],
  { component: ComponentType; valid: Readable<boolean | undefined> }
> = {
  employee: { component: EmployeeStep, valid: singleValid(employeeInfo) },
  engagement: { component: EngagementStep, valid: multiValid(engagementInfo) },
  ituser: { component: ItuserStep, valid: multiValid(ituserInfo) },
  manager: { component: ManagerStep, valid: multiValid(managerInfo) },
  address: { component: AddressStep, valid: multiValid(addressInfo) },
  summary: { component: SummaryStep, valid: never },
}

export const steps: StepDefinition[] = stepConfigs.map((config) => ({
  ...config,
  ...wiring[config.id],
}))
