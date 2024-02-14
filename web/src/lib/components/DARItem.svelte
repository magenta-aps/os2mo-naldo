<script lang="ts">
  import { _ } from "svelte-i18n"
  export let item: DarAddressResponse
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-secondary">{item.tekst}</div>
  </div>
</div>
