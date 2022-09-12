<script lang="ts">
  import { createEventDispatcher } from "svelte"
  let dispatch = createEventDispatcher()

  export let items: string[]
  export let activeItem: string
  export let tabFormat = "tab tab-bordered"
  export let styling: string
</script>

<div class="tabs {styling}">
  {#each items as item}
    <div
      class="{tabFormat} {item === activeItem ? 'tab-active' : ''}"
      on:click={() => dispatch("tabChange", item)}
    >
      {item}
    </div>
  {/each}
</div>
