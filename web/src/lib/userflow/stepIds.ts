// Free of component and store imports so stepStore and the form buttons can
// depend on it without a cycle. The wiring lives in ./registry.ts.

export type StepId =
  | "employee"
  | "engagement"
  | "ituser"
  | "manager"
  | "address"
  | "summary"

export type StepConfig = {
  id: StepId
  // Entity i18n key rendered as `create_item { item }` in the Stepper;
  // null renders the plain step id key (the summary step).
  entityKey: string | null
  // The employee is the anchor every other entity references, and the summary
  // is the exit, so neither skips.
  skippable: boolean
  required: boolean
}

export const stepConfigs: StepConfig[] = [
  { id: "employee", entityKey: "employee", skippable: false, required: true },
  { id: "engagement", entityKey: "engagement", skippable: true, required: false },
  { id: "ituser", entityKey: "ituser", skippable: true, required: false },
  { id: "manager", entityKey: "manager", skippable: true, required: false },
  { id: "address", entityKey: "address", skippable: true, required: false },
  { id: "summary", entityKey: null, skippable: false, required: false },
]

export const STEP_COUNT = stepConfigs.length
