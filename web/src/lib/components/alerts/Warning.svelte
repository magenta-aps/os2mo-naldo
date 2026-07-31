<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { success, warning } from "$lib/stores/alert"
  import Icon from "@iconify/svelte"
  import warningOutlineRounded from "@iconify/icons-material-symbols/warning-outline-rounded"

  $: if ($warning.message) console.warn($warning.message)

  $: if ($success.message) warning.clear()
</script>

{#if $warning.message}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-warning shadow-lg">
      <div class="flex gap-1">
        <Icon icon={warningOutlineRounded} width="20" height="20" />
        <span>{$warning.message}</span>
      </div>
    </div>
  </div>
{/if}
