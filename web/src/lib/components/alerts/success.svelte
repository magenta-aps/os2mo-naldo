<script lang="ts">
  import { slide } from "svelte/transition"
  import { success } from "$lib/stores/alert"
  import Icon from "$lib/components/icon.svelte"

  let show = false

  const startTimeout = () => {
    show = true
    setTimeout(
      () => {
        show = false
      },
      $success.timeOutTime ? $success.timeOutTime : 5000
    )
  }

  $: $success, startTimeout()
</script>

{#if show && $success.message}
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
