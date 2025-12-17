<script lang="ts">
  import { _ } from "svelte-i18n"

  export let address: { address_type: { name: string }; resolve: any }
</script>

<div class="text-primary text-sm">
  <span>
    {#if address.resolve.__typename === "DefaultAddress"}
      {address.address_type.name}: {address.resolve.value}
    {:else if address.resolve.__typename === "MultifieldAddress"}
      {address.address_type.name}: {address.resolve.value} {address.resolve.value2}
    {/if}
  </span>
</div>
