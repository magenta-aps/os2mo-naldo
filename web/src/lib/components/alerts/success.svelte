<script lang="ts">
  import { slide } from "svelte/transition"
  import { success } from "$lib/stores/alert"
  import Icon from "$lib/components/icon.svelte"

  const startTimeout = () => {
    setTimeout(
      () => {
        $success = { message: "" }
      },
      $success.timeOutTime ? $success.timeOutTime : 5000
    )
  }

  $: if ($success.message) {
    startTimeout()
  }
</script>

{#if $success.message}
  <div class="toast toast-end" transition:slide>
    {#if $success.type == "organisation" || $success.type == "employee"}
      <a
        href={`/${$success.type}/${$success.uuid}`}
        class="alert alert-success shadow-lg"
      >
        <div>
          <Icon type="success" />
          <span>{$success.message}</span>
        </div>
      </a>
    {:else}
      <div class="alert alert-success shadow-lg">
        <div>
          <Icon type="success" />
          <span>{$success.message}</span>
        </div>
      </div>
    {/if}
  </div>
{/if}
