<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { error } from "$lib/stores/alert"

  $: if ($error.message) {
    console.error($error.message)
    ;($error.message = $error.message.response.errors[0].extensions
      ? $error.message.response.errors[0].extensions.error_context.description
      : $error.message.response.errors[0].message),
      setTimeout(
        () => {
          $error = { message: "" }
        },
        $error.timeOutTime ? $error.timeOutTime : 5000
      )
  }
</script>

{#if $error.message}
  <div class="toast toast-end" transition:slide>
    <div class="alert alert-error shadow-lg">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current h-6 w-6 inline-block"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{$error.message}</span>
      </div>
    </div>
  </div>
{/if}
