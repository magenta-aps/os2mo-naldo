<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Button from "$lib/components/shared/Button.svelte"
  import type { HubSectionDefinition } from "$lib/userflow/sections"

  // One task-list section on the userflow hub: a heading, one row per store
  // item, and an add action. Rows expand inline into the entity's shared
  // field group; Save validates the row and stamps its status chip.
  export let definition: HubSectionDefinition

  $: ({ entityKey, store, fields, rowSummary, isEmpty } = definition)

  // At most one row of this section is expanded at a time; identified by the
  // item's client key so add/remove can't shift the editor onto another row.
  let expandedKey: string | null = null

  type FieldsRef = { validate: () => Promise<boolean> }
  // `any` at the dynamic-component seam: svelte:component erases the concrete
  // instance type, so bind:this can't be typed tighter here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let refs: Record<string, any> = {}

  const itemKey = (item: { _key?: string }, index: number) =>
    item._key ?? `index-${index}`

  const saveRow = async (key: string, index: number) => {
    const ref = refs[key] as FieldsRef | undefined
    const isValid = ref ? await ref.validate() : false
    // Sparse flags: only this row's stamp changes.
    const flags: boolean[] = []
    flags[index] = isValid
    store.setValidated(flags)
    if (isValid) {
      expandedKey = null
    }
  }

  const addRow = () => {
    const items = $store
    // Reuse a pristine trailing row instead of stacking blanks.
    const lastIndex = items.length - 1
    if (lastIndex >= 0 && isEmpty(items[lastIndex]) && !items[lastIndex].validated) {
      expandedKey = itemKey(items[lastIndex], lastIndex)
      return
    }
    store.addItem()
    const grown = $store
    expandedKey = itemKey(grown[grown.length - 1], grown.length - 1)
  }

  const removeRow = (key: string, index: number) => {
    if (expandedKey === key) {
      expandedKey = null
    }
    store.removeItem(index)
  }
</script>

<div>
  <div class="flex items-baseline gap-2 pb-2">
    <h4 class="text-sm font-bold">
      {capital($_(entityKey, { values: { n: 2 } }))}
    </h4>
    <span class="text-xs text-base-content/60">
      {$_("optional")} · {$store.filter((item) => !isEmpty(item)).length}
      {$_("added")}
    </span>
  </div>
  <div class="grid gap-2">
    {#each $store as item, index (itemKey(item, index))}
      {@const key = itemKey(item, index)}
      {@const summary = rowSummary(item)}
      {#if !isEmpty(item) || item.validated !== undefined || expandedKey === key}
        <div class="bg-base-200 rounded-sm">
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold truncate">{summary.title}</div>
              <div class="text-xs text-base-content/60 truncate">{summary.meta}</div>
            </div>
            {#if item.validated === true}
              <span class="badge badge-success badge-sm whitespace-nowrap">
                {capital($_("complete"))}
              </span>
            {:else if item.validated === false}
              <span class="badge badge-warning badge-sm whitespace-nowrap">
                {capital($_("incomplete"))}
              </span>
            {:else}
              <span class="badge badge-ghost badge-sm whitespace-nowrap">
                {capital($_("in_progress"))}
              </span>
            {/if}
            <button
              type="button"
              class="btn btn-xs btn-ghost"
              on:click={() => (expandedKey = expandedKey === key ? null : key)}
            >
              {expandedKey === key ? capital($_("collapse")) : capital($_("edit"))}
            </button>
            <button
              type="button"
              class="btn btn-xs btn-ghost text-error"
              on:click={() => removeRow(key, index)}
            >
              {capital($_("remove"))}
            </button>
          </div>
          {#if expandedKey === key}
            <div class="border-t border-base-300 p-6">
              <svelte:component
                this={fields}
                bind:value={$store[index]}
                bind:this={refs[key]}
                idPrefix="{entityKey}-{index}-"
              />
              <div class="flex gap-3 pt-2">
                <Button
                  type="button"
                  title={capital($_("save"))}
                  on:click={() => saveRow(key, index)}
                />
                <Button
                  type="button"
                  title={capital($_("collapse"))}
                  outline={true}
                  on:click={() => (expandedKey = null)}
                />
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
    <button
      type="button"
      class="text-left text-sm font-semibold text-primary bg-base-200/50 border border-dashed border-base-300 rounded-sm px-4 py-3 hover:bg-base-200"
      on:click={addRow}
    >
      + {capital(
        $_("add_item", { values: { item: $_(entityKey, { values: { n: 1 } }) } })
      )}
    </button>
  </div>
</div>
