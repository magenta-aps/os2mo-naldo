import type { ComponentType } from "svelte"
import { derived, readable, type Readable } from "svelte/store"
import { stepConfigs, type StepConfig } from "$lib/userflow/stepIds"
import EmployeeStep from "$lib/components/userflow/EmployeeStep.svelte"
import EntityStep from "$lib/components/userflow/EntityStep.svelte"
import EngagementFields from "$lib/components/forms/entity/EngagementFields.svelte"
import ItuserStep from "$lib/components/userflow/ItuserStep.svelte"
import ManagerStep from "$lib/components/userflow/ManagerStep.svelte"
import AddressFields from "$lib/components/forms/entity/AddressFields.svelte"
import SummaryStep from "$lib/components/userflow/SummaryStep.svelte"
import { employeeInfo } from "$lib/stores/employeeInfoStore"
import { engagementInfo } from "$lib/stores/engagementInfoStore"
import { ituserInfo } from "$lib/stores/ituserInfoStore"
import { managerInfo } from "$lib/stores/managerInfoStore"
import { addressInfo } from "$lib/stores/addressInfoStore"
import type { Validatable } from "$lib/stores/createStepStore"

// The non-serialisable half of a step. Named because `wiring` below holds
// exactly this, with the StepConfig half coming from stepConfigs.
type StepWiring = {
  component: ComponentType
  // Props for the component (the generic EntityStep needs its wiring).
  props?: Record<string, unknown>
  // Drives the Stepper's checkmark; undefined until the step is visited.
  valid: Readable<boolean | undefined>
}

export type StepDefinition = StepConfig & StepWiring

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

const wiring: Record<StepConfig["id"], StepWiring> = {
  employee: { component: EmployeeStep, valid: singleValid(employeeInfo) },
  engagement: {
    component: EntityStep,
    props: { fields: EngagementFields, store: engagementInfo, entityKey: "engagement" },
    valid: multiValid(engagementInfo),
  },
  ituser: { component: ItuserStep, valid: multiValid(ituserInfo) },
  manager: { component: ManagerStep, valid: multiValid(managerInfo) },
  address: {
    component: EntityStep,
    props: { fields: AddressFields, store: addressInfo, entityKey: "address" },
    valid: multiValid(addressInfo),
  },
  summary: { component: SummaryStep, valid: never },
}

export const steps: StepDefinition[] = stepConfigs.map((config) => ({
  ...config,
  ...wiring[config.id],
}))
