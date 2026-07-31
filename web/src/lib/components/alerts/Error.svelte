<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { error, success } from "$lib/stores/alert"
  import { capital } from "$lib/utils/helpers"
  import Icon from "@iconify/svelte"
  import errorCircleRoundedOutline from "@iconify/icons-material-symbols/error-circle-rounded-outline"

  $: err = $error.message
    ? $error.message.response?.errors?.[0] ?? $error.message
    : null
  $: errorKey = err ? err.extensions?.error_context?.error_key ?? err.message : ""
  $: requestId = $error.message?.requestId
  $: if (err) console.error(err, { requestId })

  $: if ($success.message) error.clear()
</script>

{#if errorKey}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-error shadow-lg">
      <div class="flex flex-col gap-1">
        <div class="flex gap-1">
          <Icon icon={errorCircleRoundedOutline} width="20" height="20" />
          <span>{$_(errorKey)}</span>
        </div>
        <span class="text-xs select-all">
          {capital($_("request_id"))}: {requestId}
        </span>
      </div>
    </div>
  </div>
{/if}
