<script lang="ts">
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { fetchParentTree } from "$lib/util/parent_tree"

  export let currentOrg: string
  export let uuid: string
  export let orgSelector: boolean = false
</script>

{#await fetchParentTree(uuid, $date)}
  <div class="text-secondary py-5">Loading breadcrumbs...</div>
{:then parents}
  <div class="text-secondary py-5 breadcrumbs">
    <ul>
      {#each parents.reverse() as parent}
        <li>
          {#if orgSelector}
            <button
              class="cursor-pointer link text-primary"
              on:click={() => {
                currentOrg = parent.name
                uuid = parent.uuid
              }}
            >
              {parent.name}
            </button>
          {:else}
            <a href="{base}/organisation/{parent.uuid}">
              {parent.name}
            </a>
          {/if}
        </li>
      {/each}
      <li>
        {currentOrg}
      </li>
    </ul>
  </div>
{/await}
