<script lang="ts">
  export let item: Autocomplete
  export let wantedAttrs: string[]
  export let showAttrs = true
  export let showPath = true
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-secondary">{item.name}</div>
    {#if showAttrs}
      {#each item.attrs as attr}
        {#if wantedAttrs.includes(attr.title)}
          <br />
          <div class="inline-block text-primary font-bold text-sm">
            {attr.title + ": "}
          </div>
          <div class="inline-block text-primary text-sm">
            {attr.value}
          </div>
        {/if}
      {/each}
    {/if}
    {#if showPath && item.path}
      <br />
      {#each item.path.slice(0, -1) as path}
        <div class="inline-block text-primary text-xs">{path + "/"}</div>
      {/each}
    {/if}
  </div>
</div>
