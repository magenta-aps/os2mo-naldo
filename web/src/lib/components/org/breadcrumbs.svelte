<script lang="ts">
  import { base } from "$app/paths"
  import { fetchParentTree } from "$lib/util/parent_tree"

  export let currentOrg: string
  export let uuid: string
</script>

{#await fetchParentTree(uuid)}
  <div class="text-secondary py-5">Loading breadcrumbs...</div>
{:then parents}
  <div class="text-secondary py-5 breadcrumbs">
    <ul>
      {#each parents.reverse() as parent}
        <li>
          <a href="{base}/organisation/{parent.uuid}">
            {parent.name}
          </a>
        </li>
      {/each}
      <li>
        {currentOrg}
      </li>
    </ul>
  </div>
{/await}
