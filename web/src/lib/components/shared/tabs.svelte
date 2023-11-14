<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let items: string[]
  export let activeItem: string

  let dispatch = createEventDispatcher()
</script>

<div class="tabs">
  {#each items as item}
    <a
      href="#{item}"
      data-sveltekit-replacestate
      class="tab tab-bordered text-base hover:no-underline
      {item === activeItem ? 'border-primary text-primary' : 'text-secondary'}"
      on:click={() => dispatch("tabChange", item)}
    >
      {item}
    </a>
  {/each}
</div>
