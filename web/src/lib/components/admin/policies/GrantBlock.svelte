<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { createEventDispatcher } from "svelte"
  import Icon from "@iconify/svelte"
  import deleteOutlineRounded from "@iconify/icons-material-symbols/delete-outline-rounded"
  import CelEditor from "./CelEditor.svelte"

  // One grant: the items it covers (fields or mutators) under one condition.
  export let id: string
  export let kind: "read" | "write"
  export let title: string
  // The collection, when the group heading does not already name it
  export let collection: string | undefined = undefined
  export let options: string[]
  export let selected: string[]
  export let condition: string
  export let version: string | undefined = undefined
  export let disabled = false
  export let loading = false
  export let loadError = false
  export let missingCondition = false
  export let celError: string | undefined = undefined
  export let celFlagged = false

  const dispatch = createEventDispatcher<{
    select: string[]
    condition: string
    remove: void
  }>()

  $: allSelected = options.length > 0 && selected.length === options.length
  $: someSelected = selected.length > 0 && !allSelected

  const toggle = (item: string, on: boolean) =>
    dispatch("select", on ? [...selected, item] : selected.filter((s) => s !== item))
</script>

<div
  class="flex flex-col gap-2 p-4 border border-base-300 rounded-sm"
  data-grant={kind}
>
  <fieldset aria-label={title}>
    <div class="flex items-center gap-4 pb-1">
      <span class="text-sm">
        {title}
        {#if collection}
          <span class="font-mono text-base-content/60">{collection}</span>
        {/if}
      </span>
      <span class="flex-1" />
      {#if version}
        <span class="badge badge-sm badge-ghost font-mono">{version}</span>
      {/if}
      {#if !disabled}
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          aria-label={capital($_("policy_remove_rule"))}
          on:click={() => dispatch("remove")}
        >
          <Icon icon={deleteOutlineRounded} width="18" height="18" />
        </button>
      {/if}
    </div>

    {#if loading && !options.length}
      <span class="loading loading-dots loading-sm" />
    {:else if loadError}
      <p class="text-sm text-error">{capital($_("load_error"))}</p>
    {/if}

    <div>
      {#if !disabled && options.length}
        <label
          class="label flex items-center gap-4 py-2 px-4 rounded-lg text-sm text-base-content cursor-pointer hover:bg-base-200 transition-all"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-primary rounded-sm"
            checked={allSelected}
            indeterminate={someSelected}
            on:change={() => dispatch("select", allSelected ? [] : options)}
          />
          <span class="label-text text-base-content">
            {capital($_(allSelected ? "deselect_all" : "select_all"))}
          </span>
        </label>
      {/if}
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {#each options as item (item)}
          <label
            class="label flex items-center gap-4 py-2 px-4 rounded-lg min-w-0 text-sm text-base-content cursor-pointer hover:bg-base-200 transition-all"
          >
            <input
              type="checkbox"
              class="checkbox checkbox-primary rounded-sm shrink-0"
              checked={selected.includes(item)}
              {disabled}
              on:change={(e) => toggle(item, e.currentTarget.checked)}
            />
            <span class="label-text text-base-content font-mono break-all">{item}</span>
          </label>
        {/each}
      </div>
    </div>
  </fieldset>

  {#if !disabled && !selected.length}
    <p class="text-sm text-base-content/70" data-empty-grant>
      {capital($_("policy_empty_grant"))}
    </p>
  {/if}

  <CelEditor
    id="{id}-condition"
    value={condition}
    on:change={(e) => dispatch("condition", e.detail)}
    invalid={missingCondition}
    error={celError}
    flagged={celFlagged}
    {disabled}
  />
</div>
