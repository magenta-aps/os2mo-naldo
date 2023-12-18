<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let items: string[]
  export let activeItem: string

  let dispatch = createEventDispatcher()
</script>

<div class="tabs tabs-bordered">
  {#each items as item}
    <a
      href="#{item}"
      data-sveltekit-replacestate
      class="tab text-base hover:no-underline
      {item === activeItem ? 'tab-active text-primary' : 'text-secondary'}"
      on:click={() => dispatch("tabChange", item)}
    >
      {item}
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
