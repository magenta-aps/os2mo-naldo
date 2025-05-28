<script lang="ts" generic="T">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Icon from "@iconify/svelte"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"

  export let items: any
  export let selectedIndex: number
  export let setSelectedIndex: (index: number) => void
  export let removeItem: (index: number) => void
  export let addItem: () => void
  export let label: string
  $: {
    console.log(items)
  }
</script>

<div class="tabs tabs-lifted mb-4 flex flex-wrap">
  {#each items as item, i}
    <button
      class="tab flex gap-2 cursor-pointer [--tab-border-color:transparent]"
      class:tab-active={selectedIndex === i}
      class:[--tab-bg:bg-slate-100]={selectedIndex === i}
      class:text-error={item.validated === false}
      class:bg-white={selectedIndex !== i}
      on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex(i)
      }}
    >
      <span>{capital($_(label, { values: { n: 1 } }))} {i + 1}</span>
      {#if items.length > 1}
        <button
          class="btn btn-xs btn-circle btn-ghost text-secondary hover:bg-error"
          type="button"
          on:click={(e) => {
            e.preventDefault()
            e.stopPropagation()
            removeItem(i)
          }}
          aria-label={`Remove ${label} ${i + 1}`}
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
      addItem()
    }}
    aria-label={`Add ${label}`}
  >
    <Icon icon={addRounded} width="20" height="20" />
  </button>
</div>
