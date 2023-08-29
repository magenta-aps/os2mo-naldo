<script lang="ts">
  export let item: Autocomplete
  export let wantedAttrs: string[]
</script>

<div class="flex items-center cursor-default text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-secondary">{item.name}</div>
    {#each item.attrs as attr}
      {#if wantedAttrs.includes(attr.title)}
        <div class="inline-block text-primary text-xs">{attr.value + " "}</div>
      {/if}
    {/each}
    {#if item.path}
      {#each item.path.slice(0, -1) as path}
        <div class="inline-block text-primary text-xs">{path + "/"}</div>
      {/each}
    {/if}
  </div>
</div>
