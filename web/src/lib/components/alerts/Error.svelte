<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { error, success } from "$lib/stores/alert"
  import Icon from "@iconify/svelte"
  import errorCircleRoundedOutline from "@iconify/icons-material-symbols/error-circle-rounded-outline"

  $: err = $error.message ? $error.message.response.errors?.[0] : null
  $: errorKey = err ? err.extensions?.error_context?.error_key ?? err.message : ""
  $: if (err) console.error(err)

  $: if ($success.message) error.clear()
</script>

{#if errorKey}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-error shadow-lg">
      <div class="flex gap-1">
        <Icon icon={errorCircleRoundedOutline} width="20" height="20" />
        <span>{$_(errorKey)}</span>
      </div>
    </div>
  </div>
{/if}
