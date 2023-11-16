<script lang="ts">
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import Icon from "$lib/components/icon.svelte"

  // Will be sortable if given a sortPath
  type Header = {
    title: string
    sortPath?: string
  }

  export let headers: Header[]

  const sortTable = (key: string) => {
    // If the same key is clicked, reverse the sort direction
    if ($sortKey === key) {
      $sortDirection = -$sortDirection
    } else {
      $sortKey = key
      $sortDirection = 1
    }
  }
  console.log("headers!", headers)
</script>

<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers}
      <thead class="text-left">
        <tr>
          {#each headers as header}
            <th
              on:click={() => {
                sortTable(header.sortPath || "")
              }}
              class="{header.sortPath ? 'cursor-pointer' : ''} 
                px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-100"
            >
              <div class="flex items-center">
                {header.title}
                {#if header.sortPath}
                  <div class="flex flex-col items-center justify-center w-4 h-4 pl-2">
                    <Icon
                      type="arrow"
                      size="12"
                      class="-rotate-90"
                      fillOpacity={$sortKey === header.sortPath && $sortDirection === -1
                        ? "1"
                        : "0.3"}
                    />
                    <Icon
                      type="arrow"
                      size="12"
                      class="rotate-90"
                      fillOpacity={$sortKey === header.sortPath && $sortDirection === 1
                        ? "1"
                        : "0.3"}
                    />
                  </div>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody
      class="[&>*:nth-child(even)]:bg-slate-100 border-slate-300 min-h-64 text-slate-600"
    >
      <slot />
    </tbody>
  </table>
</div>
