<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { firstValidDay, formatDay, lastValidDay } from "$lib/utils/date"
  import type { PrimaryManager } from "$lib/http/getPrimaryManagers"

  // The live lookup of the unit's other primary manager roles.
  export let managers: PrimaryManager[] | undefined
  export let loadError: boolean
  // The primary field's errors from the submit-time lookup.
  export let errors: string[]
</script>

{#if loadError || errors.includes("load_error")}
  <p class="text-sm text-error">{capital($_("load_error"))}</p>
{/if}
{#if managers?.length || errors.includes("primary_manager_taken")}
  <div class="-mt-3 pb-3 text-xs text-error">
    <p>
      {capital($_("validation.primary_manager_taken"))}{managers?.length ? ":" : ""}
    </p>
    <ul>
      {#each managers ?? [] as manager}
        <li>
          {manager.name ?? capital($_("vacant"))}
          ({formatDay(firstValidDay(manager.from))} – {formatDay(
            lastValidDay(manager.to)
          )})
        </li>
      {/each}
    </ul>
  </div>
{/if}
