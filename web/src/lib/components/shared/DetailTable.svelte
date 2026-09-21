<script lang="ts">
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { setColumnLock } from "$lib/components/shared/columnLock"
  import Icon from "@iconify/svelte"
  import keyboardArrowUpRounded from "@iconify/icons-material-symbols/keyboard-arrow-up-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

  export let headers: Header[]

  let table: HTMLTableElement
  let holds = 0

  // Column widths as percentages, so a pinned table still follows its container
  // when the window resizes. The measured total goes on as a min-width: with an
  // auto layout the content can push the table wider than its scroll container,
  // and `w-full` under a fixed layout would otherwise collapse it back.
  // Queried rather than indexed off `tHead.rows`, which is empty unless the
  // header cells are wrapped in a `tr`.
  const headerCells = () =>
    Array.from(table?.querySelectorAll<HTMLTableCellElement>("thead th") ?? [])

  const pin = () => {
    const total = table?.offsetWidth
    const cells = headerCells()
    if (!total || !cells.length) return
    for (const cell of cells) {
      cell.style.width = `${(cell.offsetWidth / total) * 100}%`
    }
    table.style.minWidth = `${total}px`
    table.style.tableLayout = "fixed"
  }

  const unpin = () => {
    if (!table) return
    table.style.tableLayout = ""
    table.style.minWidth = ""
    for (const cell of headerCells()) cell.style.width = ""
  }

  // Counted, because several rows can be expanded at once
  setColumnLock({
    hold: () => {
      if (holds++ === 0) pin()
    },
    release: () => {
      if (holds > 0 && --holds === 0) unpin()
    },
  })

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
  <table bind:this={table} class="border-base-300 w-full">
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
