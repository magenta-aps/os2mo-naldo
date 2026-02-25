<script lang="ts">
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import keyboardArrowUpRounded from "@iconify/icons-material-symbols/keyboard-arrow-up-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

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
</script>

<div class="overflow-x-auto rounded-sm border mb-8">
  <table class="border-base-300 w-full">
    {#if headers}
      <thead class="text-left">
        {#each headers as header}
          <th
            on:click={() => {
              sortTable(header.sortPath || "")
            }}
            class="{header.sortPath ? 'cursor-pointer' : ''}
                px-4 py-3 font-bold leading-4 tracking-wider text-left text-base-content border-base-300 bg-base-300"
          >
            <div class="flex items-center">
              {header.title}
              {#if header.sortPath}
                <div class="flex flex-col items-center justify-center pl-1">
                  <Icon
                    icon={keyboardArrowUpRounded}
                    width="16"
                    height="16"
                    class="relative top-1 {$sortKey === header.sortPath &&
                    $sortDirection === -1
                      ? 'opacity-100'
                      : 'opacity-30'}
                    "
                  />
                  <Icon
                    icon={keyboardArrowDownRounded}
                    width="16"
                    height="16"
                    class="relative bottom-1 {$sortKey === header.sortPath &&
                    $sortDirection === 1
                      ? 'opacity-100'
                      : 'opacity-30'}
                    "
                  />
                </div>
              {/if}
            </div>
          </th>
        {/each}
        <th class="px-4 py-3 bg-base-300" />
      </thead>
    {/if}
    <tbody class="border-base-300 min-h-64">
      <slot />
    </tbody>
  </table>
</div>
