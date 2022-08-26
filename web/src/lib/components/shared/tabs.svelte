<script lang="ts">
  import { createEventDispatcher } from "svelte"
  let dispatch = createEventDispatcher()

  export let items: string[]
  export let activeItem: string
  export let tabFormat = "tab tab-lifted"
</script>

<div class="tabs">
  {#each items as item}
    <div
      class="{tabFormat} {item === activeItem ? 'tab-active' : ''}"
      on:click={() => dispatch("tabChange", item)}
    >
      {item}
    </div>
  {/each}
</div>
