<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import SvelteSelect from "svelte-select"
  import { afterUpdate } from "svelte"
  import type { TradeUnionGroup } from "$lib/http/getClasses"

  type Value = {
    uuid: string | null
    name: string
    user_key?: string | null
  }

  export let title: string | undefined = undefined
  export let id: string
  export let name: string | undefined = undefined
  // Each group's children are its options.
  export let iterable: TradeUnionGroup[] | undefined
  export let required = false
  export let placeholder: string = ""
  export let disabled = false
  export let startValue: Value | undefined = undefined
  export let value: Value | undefined = startValue || undefined
  export let isClearable: boolean | undefined = false
  export let extra_classes = ""
  export let errors: string[] = []

  $: if (value?.name) {
    name = value?.name
  }

  const itemId = "uuid" // Used by the component to differentiate between items

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }

  $: items = iterable
    ?.flatMap((group) =>
      group.children.map((child) => ({
        group: group.name,
        label: child.name,
        uuid: child.uuid,
      }))
    )
    .sort((a, b) => (a.label > b.label ? 1 : -1))

  // A refetch for a new date can drop the selected option. Cleared after the
  // update, not in a `$:` statement: `value` is bound to SvelteSelect. Without
  // the timeout SvelteSelect keeps displaying the cleared selection.
  afterUpdate(() => {
    if (value && items && !items.some((item) => item.uuid === value?.uuid)) {
      setTimeout(() => {
        value = undefined
        name = ""
      }, 1)
    }
  })

  const groupBy = (item: any) => item.group
</script>

<div class="pb-3 {extra_classes}">
  <div class="form-control w-full pb-1">
    {#if title || required}
      <label for={id} class="text-sm text-base-content pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
      </label>
    {/if}
    <SvelteSelect
      --font-size="1rem"
      --height="2rem"
      --item-padding="0.25rem 0.75rem 0.25rem 0.75rem"
      --item-height="auto"
      --item-line-height="auto"
      --value-container-padding="0rem"
      --clear-select-height="1.5rem"
      --clear-select-width="1.5rem"
      --border-radius="0.25rem"
      --padding="0 0 0 0.75rem"
      id="select"
      {floatingConfig}
      hasError={errors.length ? true : false}
      {disabled}
      {itemId}
      showChevron={true}
      clearable={isClearable}
      {placeholder}
      groupHeaderSelectable={false}
      {items}
      {groupBy}
      searchable={false}
      bind:value
      on:change
      on:clear
    >
      <div slot="item" let:item class="cursor-pointer">
        {item.label}
      </div>

      <div slot="selection" let:selection class="cursor-pointer">
        {selection.label}
      </div>
    </SvelteSelect>
  </div>
  {#if value}
    <input hidden {id} name={id} bind:value={value.uuid} />
  {/if}
  {#each errors as error}
    {#if error === "required"}
      <span class="text-xs text-error"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
