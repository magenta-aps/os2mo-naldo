<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { error, success } from "$lib/stores/alert"
  import Icon from "@iconify/svelte"
  import errorCircleRoundedOutline from "@iconify/icons-material-symbols/error-circle-rounded-outline"

  let errorMessage = ""

  $: if ($error.message) {
    console.error($error.message)
    errorMessage = $error.message.response.errors.extensions
      ? $error.message.response.errors[0].extensions.error_context.description
      : $error.message.response.errors[0].message
    setTimeout(() => (errorMessage = ""), 5000)
  }
  $: if ($success) {
    errorMessage = ""
  }
</script>

{#if errorMessage}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-error shadow-lg">
      <div class="flex gap-1">
        <Icon icon={errorCircleRoundedOutline} width="20" height="20" />
        <span>{errorMessage}</span>
      </div>
    </div>
  </div>
{/if}
