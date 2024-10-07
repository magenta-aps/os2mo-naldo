<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { step } from "$lib/stores/stepStore"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"

  // IDK about this
  $: items = [
    { name: "Opret medarbejder", count: 1, valid: $employeeInfo.validated },
    { name: "Opret engagement", count: 2, valid: $engagementInfo.validated },
    { name: "Opret IT-bruger", count: 3, valid: $ituserInfo.validated },
    { name: "Opret manager", count: 4, valid: $managerInfo.validated },
    { name: "Opret adresse", count: 5, valid: $addressInfo.validated },
    { name: "Opsummering", count: 6, valid: false },
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
      {item.valid ? "✓" : ""}
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
