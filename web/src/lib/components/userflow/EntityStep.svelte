<script lang="ts">
  import type { ComponentType } from "svelte"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import OnboardingFormButtons from "$lib/components/userflow/OnboardingFormButtons.svelte"
  import OnboardingTab from "$lib/components/userflow/OnboardingTab.svelte"
  import type { Keyed, Validatable } from "$lib/stores/createStepStore"
  import type { Readable } from "svelte/store"

  type Item = $$Generic<Validatable & Keyed>

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

  type FieldsRef = { validate: () => Promise<boolean> }
  // Keyed by item, not index: tab removal must never let a shifted ref answer
  // for another item. `any` because svelte:component erases the instance type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let refs: Record<string, any> = {}

  const submit = async () => {
    // A missing ref counts as invalid, so the flags can never mis-align.
    const results = await Promise.all(
      $store.map((item) => {
        const ref = refs[item._key] as FieldsRef | undefined
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
      <!-- Keyed so removing a tab destroys that tab's component; unkeyed, the
           remaining items shift into instances still holding the old values.
           Inactive tabs stay mounted so every tab's form() can validate. -->
      {#each $store as item, index (item._key)}
        <div class:hidden={index !== selectedTab}>
          <svelte:component
            this={fields}
            bind:value={$store[index]}
            bind:this={refs[item._key]}
            idPrefix="{entityKey}-{index}-"
          />
        </div>
      {/each}
    </div>
  </div>
  <OnboardingFormButtons />
  <Error />
</form>
