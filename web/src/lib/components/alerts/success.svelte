<script lang="ts">
  import { slide } from "svelte/transition"
  import { success } from "$lib/stores/alert"
  import Icon from "$lib/components/icon.svelte"
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import { base } from "$app/paths"

  const startTimeout = () => {
    setTimeout(
      () => {
        $success = { message: "" }
      },
      $success.timeOutTime ? $success.timeOutTime : 5000
    )

    // Will redirect if the successful action was on an organisation or employee
    if ($success.type == "organisation" || $success.type == "employee") {
      setTimeout(() => {
        if ($success.uuid !== null) {
          setTimeout(() => goto(`${base}/${$success.type}/${$success.uuid}`), 200)
        } else {
          setTimeout(() => goto(`${base}/`), 200)
        }
      }, 200)
    }
  }

  $: if ($success.message) {
    startTimeout()
  }
</script>

{#if $success.message}
  <div class="toast toast-end" transition:slide>
    {#if $success.type == "organisation" || $success.type == "employee"}
      {#if $success.uuid !== null}
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
        <a href="/" class="alert alert-success shadow-lg">
          <div>
            <Icon type="success" />
            <span>{$success.message}</span>
          </div>
        </a>
      {/if}
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
