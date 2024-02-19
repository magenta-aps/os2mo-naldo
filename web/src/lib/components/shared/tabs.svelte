<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { createEventDispatcher } from "svelte"
  import { MOConfig } from "$lib/stores/config"
  import { OrgTab, EmployeeTab } from "$lib/stores/tab"

  export let items: { label: string; value: string; n: number }[]
  export let activeItem: string

  let dispatch = createEventDispatcher()

  if ($MOConfig.confdb_show_kle === "false") {
    items = items.filter((tab) => tab.value !== OrgTab.KLE)
  }
  if ($MOConfig.show_it_associations_tab === "false") {
    items = items.filter((tab) => tab.value !== EmployeeTab.ITASSOCIATION)
  }
</script>

<div class="tabs tabs-bordered">
  {#each items as item}
    <a
      href="#{item.value}"
      data-sveltekit-replacestate
      class="tab text-base hover:no-underline
      {item.value === activeItem ? 'tab-active text-primary' : 'text-secondary'}"
      on:click={() => dispatch("tabChange", item.value)}
    >
      {capital($_(item.value, { values: { n: item.n } }))}
    </a>
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
