<script lang="ts">
  import { _ } from "svelte-i18n"
  import { slide } from "svelte/transition"
  import { success } from "$lib/stores/alert"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import Icon from "@iconify/svelte"
  import checkCircleOutlineRounded from "@iconify/icons-material-symbols/check-circle-outline-rounded"
  import { updateGlobalNavigation } from "$lib/stores/navigation"

  const startTimeout = () => {
    setTimeout(
      () => {
        $success = { message: "" }
      },
      $success.timeOutTime ? $success.timeOutTime : 5000
    )

    if (
      $success.type == "organisation" ||
      $success.type == "employee" ||
      $success.type == "admin"
    ) {
      setTimeout(() => {
        if ($success.uuid) {
          setTimeout(() => {
            goto(`${base}/${$success.type}/${$success.uuid}`)
            updateGlobalNavigation($success.uuid)
          }, 200)
        } else if ($success.type == "admin") {
          setTimeout(() => goto(`${base}/${$success.type}`), 200)
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
      {#if $success.uuid}
        <a
          href={`/${$success.type}/${$success.uuid}`}
          class="shadow-lg alert alert-success"
        >
          <div class="flex gap-1">
            <Icon icon={checkCircleOutlineRounded} width="20" height="20" />
            <span>{$success.message}</span>
          </div>
        </a>
      {:else}
        <a href="/" class="shadow-lg alert alert-success">
          <div class="flex gap-1">
            <Icon icon={checkCircleOutlineRounded} width="20" height="20" />
            <span>{$success.message}</span>
          </div>
        </a>
      {/if}
    {:else}
      <div class="shadow-lg alert alert-success">
        <div class="flex gap-1">
          <Icon icon={checkCircleOutlineRounded} width="20" height="20" />
          <span>{$success.message}</span>
        </div>
      </div>
    {/if}
  </div>
{/if}
