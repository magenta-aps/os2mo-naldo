<script lang="ts">
  import SvelteSelect from "svelte-select"
  import type { Class } from "$lib/graphql/types"

  type Value = {
    uuid: string | null
    name: string
    user_key?: string | null
  }

  export let title: string | undefined = undefined
  export let id: string
  export let name: string | undefined = undefined
  export let iterable: any[]
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

  // Flattening data
  const flatData = iterable.flatMap((group) => {
    return group.objects.flatMap((parent: Class) => {
      const groupName = parent.name
      return parent.children.map((child) => ({
        group: groupName,
        label: child.name,
        uuid: child.uuid,
      }))
    })
  })

  const groupBy = (item: any) => item.group
</script>

<div class="pb-3 {extra_classes}">
  <div class="form-control w-full pb-1">
    {#if title || required}
      <label for={id} class="text-sm text-secondary pb-1">
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
      --icons-color="#00244E"
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
      items={flatData}
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
      <span class="label-text-alt text-error block">{title} skal udfyldes</span>
    {/if}
  {/each}
</div>
