<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { createEventDispatcher } from "svelte"
  import { OrgTab, EmployeeTab } from "$lib/stores/tab"
  import { env } from "$lib/env"

  export let items: { label: string; value: string; n: number }[]
  export let activeItem: string
  export let extra_classes: string = ""

  let dispatch = createEventDispatcher()

  if (!env.PUBLIC_SHOW_KLE) {
    items = items.filter((tab) => tab.value !== OrgTab.KLE)
  }
  if (!env.PUBLIC_SHOW_IT_ASSOCIATIONS_TAB) {
    items = items.filter((tab) => tab.value !== EmployeeTab.ITASSOCIATION)
  }
  // checking if not "true", to be explicit where we want it shown
  if (!env.PUBLIC_SHOW_ROLEBINDINGS) {
    items = items.filter((tab) => tab.value !== EmployeeTab.ROLEBINDING)
  }
</script>

<!-- TODO: Handle tabs when screen gets smaller, e.g. as a dropdown? -->
<div
  class="whitespace-wrap block xl:tabs tabs-border xxl:whitespace-nowrap w-full flex {extra_classes}"
>
  {#each items as item}
    <a
      href="#{item.value}"
      data-sveltekit-replacestate
      class="tab flex-1 text-center text-base hover:no-underline
      {item.value === activeItem ? 'tab-active text-primary' : 'text-base-content'}"
      on:click={() => dispatch("tabChange", item.value)}
    >
      {capital($_(item.value, { values: { n: item.n } }))}
    </a>
  {/each}
</div>
