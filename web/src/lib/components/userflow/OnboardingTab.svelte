<script lang="ts" generic="T">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Icon from "@iconify/svelte"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"

  export let items: any
  export let selectedIndex: number
  export let setSelectedIndex: (index: number) => void
  export let removeItem: (index: number) => void
  export let addItem: () => void
  export let label: string
</script>

<div class="tabs tabs-lifted mb-4 flex flex-wrap">
  {#each items as item, i}
    <button
      class="tab flex gap-2 cursor-pointer [--tab-border-color:transparent]"
      class:tab-active={selectedIndex === i}
      class:[--tab-bg:bg-base-200]={selectedIndex === i}
      class:text-error={item.validated === false}
      class:bg-base-100={selectedIndex !== i}
      on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex(i)
      }}
    >
      <span>{capital($_(label, { values: { n: 1 } }))} {i + 1}</span>
      {#if items.length > 1}
        <button
          class="btn btn-xs btn-circle btn-ghost text-base-content hover:bg-error"
          type="button"
          aria-label={`Remove ${label} ${i + 1}`}
          on:click={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // Derived from pre-removal indices, so it never depends on `items`
            // having refreshed yet. The `items.length > 1` guard keeps last >= 0.
            const last = items.length - 2
            setSelectedIndex(
              Math.min(i < selectedIndex ? selectedIndex - 1 : selectedIndex, last)
            )
            removeItem(i)
          }}
        >
          <Icon
            icon="material-symbols:close-small-outline-rounded"
            width="20"
            height="20"
          />
        </button>
      {/if}
    </button>
  {/each}

  <button
    class="btn btn-sm btn-ghost px-2"
    on:click={(e) => {
      e.preventDefault()
      e.stopPropagation()
      // Read before adding, for the same reason as the removal handler above.
      const appended = items.length
      addItem()
      setSelectedIndex(appended)
    }}
    aria-label={`Add ${label}`}
  >
    <Icon icon={addRounded} width="20" height="20" />
  </button>
</div>
