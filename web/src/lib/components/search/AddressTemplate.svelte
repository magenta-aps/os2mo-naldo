<script lang="ts">
  export let address: {
    resolve: any
  }
  export let type: string
</script>

<div class="text-primary text-sm">
  <span>
    {#if address.resolve.__typename === "DefaultAddress"}
      {type}: {address.resolve.value}
    {:else if address.resolve.__typename === "MultifieldAddress"}
      {type}: {address.resolve.value}
      {address.resolve.value2}
    {/if}
  </span>
</div>
