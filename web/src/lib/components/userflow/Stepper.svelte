<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { step } from "$lib/stores/stepStore"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"

  // FIX: Should this be changed somehow?
  $: items = [
    {
      name: `${capital(
        $_("create_item", { values: { item: $_("employee", { values: { n: 1 } }) } })
      )}*`,
      count: 1,
      valid: $employeeInfo.validated,
    },
    {
      name: `${capital(
        $_("create_item", { values: { item: $_("engagement", { values: { n: 1 } }) } })
      )}`,
      count: 2,
      valid: $engagementInfo.validated,
    },
    {
      name: `${capital(
        $_("create_item", { values: { item: $_("ituser", { values: { n: 1 } }) } })
      )}`,
      count: 3,
      valid: $ituserInfo.validated,
    },
    {
      name: `${capital(
        $_("create_item", { values: { item: $_("manager", { values: { n: 1 } }) } })
      )}`,
      count: 4,
      valid: $managerInfo.validated,
    },
    {
      name: `${capital(
        $_("create_item", { values: { item: $_("address", { values: { n: 1 } }) } })
      )}`,
      count: 5,
      valid: $addressInfo.validated,
    },
    { name: `${capital($_("summary"))}`, count: 6, valid: false },
  ]
</script>

<!-- TODO: Mobile -->
<div class="tabs tabs-bordered whitespace-nowrap">
  {#each items as item}
    <button
      data-sveltekit-replacestate
      class="tab text-base hover:no-underline
        {item.count === $step ? 'tab-active text-primary' : 'text-secondary'}"
      on:click={() => {
        if (item.count === 1) {
          step.updateStep(item.count)
        } else if ($employeeInfo.validated === true) {
          step.updateStep(item.count)
        }
      }}
    >
      {`${item.count}. ${capital($_(item.name))}`}
      {item.valid ? "✓" : ""}
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
