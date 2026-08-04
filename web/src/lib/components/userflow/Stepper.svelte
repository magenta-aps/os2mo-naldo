<script lang="ts">
  import { derived } from "svelte/store"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { step } from "$lib/stores/stepStore"
  import { steps } from "$lib/userflow/registry"

  // Combined so the markup can index it: $-prefix auto-subscription only works
  // on top-level identifiers.
  const stepValidity = derived(
    steps.map((stepDef) => stepDef.valid),
    (values) => values
  )
</script>

<div
  class="whitespace-wrap block xl:tabs tabs-border xxl:whitespace-nowrap w-full flex"
>
  {#each steps as stepDef, index}
    {@const count = index + 1}
    <button
      class="tab flex-1 text-center text-base hover:no-underline
        {count === $step ? 'tab-active text-primary' : 'text-base-content'}"
      on:click={() => {
        // The rest of the wizard creates against the employee, so no other step
        // is reachable until it validates.
        if (count === 1 || $stepValidity[0] === true) {
          step.updateStep(count)
        }
      }}
    >
      {count}. {stepDef.entityKey
        ? capital(
            $_("create_item", {
              values: { item: $_(stepDef.entityKey, { values: { n: 1 } }) },
            })
          )
        : capital($_(stepDef.id))}{stepDef.required ? "*" : ""}
      {$stepValidity[index] ? "✓" : ""}
    </button>
  {/each}
</div>

<style>
  .tab.tab-active:not(.tab-disabled):not([disabled]),
  .tab:is(input:checked) {
    /* Keeps daisyUI from overwriting the active tab's border colour;
       the value itself is irrelevant because of `text-primary`. */
    /* https://github.com/saadeghi/daisyui/issues/2643 */
    border-color: var(--primary) !important;
  }
</style>
