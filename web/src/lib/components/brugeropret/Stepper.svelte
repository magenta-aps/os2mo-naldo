<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { step } from "$lib/stores/stepStore"
  import { createEventDispatcher } from "svelte"
  import { MOConfig } from "$lib/stores/config"
  import { OrgTab, EmployeeTab } from "$lib/stores/tab"
  import { env } from "$env/dynamic/public"

  // Change these
  let items = [
    { name: "Opret medarbejder", count: 1 },
    { name: "Opret engagement", count: 2 },
    { name: "Opret IT-bruger", count: 3 },
    { name: "Opret manager", count: 4 },
    { name: "Opret adresse", count: 5 },
  ]
</script>

<div class="tabs tabs-bordered whitespace-nowrap">
  {#each items as item}
    <button
      data-sveltekit-replacestate
      class="tab text-base hover:no-underline
        {item.count === $step ? 'tab-active text-primary' : 'text-secondary'}"
      on:click={() => step.updateStep(item.count)}
    >
      {`${item.count}. ${capital($_(item.name))}`}
    </button>
  {/each}
</div>

<style>
  .tab.tab-active:not(.tab-disabled):not([disabled]),
  .tab:is(input:checked) {
    /* this doesn't do anything, apart from making sure border-color isn't overwritten.. 
      it could say `border-color:pink` and it would still be primary because of `text-primary` */
    /* https://github.com/saadeghi/daisyui/issues/2643 */
    border-color: var(--primary) !important;
  }
</style>
