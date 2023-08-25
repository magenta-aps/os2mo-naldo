<script lang="ts">
  export let item: {
    uuid: string
    name: string
    attrs: {
      uuid: string
      value: string
      title: string
    }[]
  }

  export let wantedAttrs: string[] | undefined = undefined
</script>

<div class="flex items-center cursor-default text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-primary">{item.name}</div>
    {#each item.attrs as attr}
      {#if !wantedAttrs || wantedAttrs.includes(attr.title)}
        <div class="inline-block text-secondary">{attr.value + " "}</div>
      {/if}
    {/each}
  </div>
</div>
