<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { fetchParentTree } from "$lib/util/parent_tree"

  export let orgUnit: { name: string; uuid: string } | null | undefined = undefined
  export let emptyMessage: string = ""
  export let link: boolean = false
</script>

{#if orgUnit}
  {#await fetchParentTree(orgUnit.uuid, $date)}
    <div class="text-secondary pb-4">Loading breadcrumbs...</div>
  {:then parents}
    <div class=" breadcrumbs text-secondary pb-4 pt-0">
      <ul>
        {#each parents.reverse() as parent}
          <li>
            {#if link}
              <a href="{base}/organisation/{parent.uuid}">
                {parent.name}
              </a>
            {:else}
              <p>{parent.name}</p>
            {/if}
          </li>
        {/each}
        <li>
          {orgUnit.name}
        </li>
      </ul>
    </div>
  {/await}
{:else if !orgUnit && emptyMessage}
  <div class="text-secondary pb-4">{emptyMessage}</div>
{/if}
