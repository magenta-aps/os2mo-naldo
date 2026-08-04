<script lang="ts">
  import type { ComponentType } from "svelte"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import type { Validatable } from "$lib/stores/createStepStore"
  import type { Readable } from "svelte/store"

  type Item = $$Generic<Validatable>

  type ItemsStore = Readable<Item[]> & {
    addItem: () => void
    removeItem: (index: number) => void
    setValidated: (flags: boolean[]) => void
  }

  // Generic multi-instance wizard step: one shared field group per tab.
  export let fields: ComponentType
  // The step's items store (engagementInfo, ituserInfo, ...).
  export let store: ItemsStore
  // i18n key for the tab labels; also prefixes DOM ids per tab instance.
  export let entityKey: string

  let selectedTab = 0

  // Every tab stays mounted (inactive ones hidden) so each instance keeps a
  // live svelte-forms form(); Next can then validate all tabs, not just the
  // visible one, and per-tab field errors survive tab switches.
  type FieldsRef = { validate: () => Promise<boolean> }
  // Addressed by item key, not index: tab removal must never let a stale or
  // shifted ref answer for another item. `any` at the dynamic-component seam:
  // svelte:component erases the concrete instance type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let refs: Record<string, any> = {}

  const itemKey = (item: Item, index: number) => item._key ?? `index-${index}`

  const submit = async () => {
    // Mapped per item (a missing ref counts as invalid) so the stamped flags
    // can never mis-align with their items.
    const results = await Promise.all(
      $store.map((item, index) => {
        const ref = refs[itemKey(item, index)] as FieldsRef | undefined
        return ref ? ref.validate() : Promise.resolve(false)
      })
    )
    // The stamped flags drive the tab colouring, Stepper checkmark and summary.
    store.setValidated(results)
    if (results.every(Boolean)) {
      step.updateStep("inc")
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <OnboardingTab
      items={$store}
      label={entityKey}
      addItem={store.addItem}
      removeItem={store.removeItem}
      selectedIndex={selectedTab}
      setSelectedIndex={(index) => (selectedTab = index)}
    />
    <div class="p-8">
      <!-- Keyed by item identity: removing a tab must destroy that tab's
           component, not shift the remaining items into surviving instances
           whose svelte-forms fields still hold the removed item's values. -->
      {#each $store as item, index (itemKey(item, index))}
        <div class:hidden={index !== selectedTab}>
          <svelte:component
            this={fields}
            bind:value={$store[index]}
            bind:this={refs[itemKey(item, index)]}
            idPrefix="{entityKey}-{index}-"
          />
        </div>
      {/each}
    </div>
  </div>
  <OnboardingFormButtons />
  <Error />
</form>
