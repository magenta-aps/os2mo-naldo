<script lang="ts">
  import { _ } from "svelte-i18n"
  export let extra_classes = ""
</script>

<div class="pb-4 {extra_classes}">
  <div class="text-sm text-secondary pb-1">&nbsp;</div>
  <div
    class="skeleton input input-sm rounded text-base text-secondary font-normal w-full"
  />
</div>
