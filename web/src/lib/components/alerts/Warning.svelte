<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { success, warning } from "$lib/stores/alert"
  import Icon from "@iconify/svelte"
  import warningOutlineRounded from "@iconify/icons-material-symbols/warning-outline-rounded"

  let warningMessage = ""

  $: if ($warning.message) {
    console.warn($warning.message)
    warningMessage = $warning.message
    setTimeout(() => (warningMessage = ""), 5000)
  }
  $: if ($success) {
    warningMessage = ""
  }
</script>

{#if warningMessage}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-warning shadow-lg">
      <div class="flex gap-1">
        <Icon icon={warningOutlineRounded} width="20" height="20" />
        <span>{warningMessage}</span>
      </div>
    </div>
  </div>
{/if}
