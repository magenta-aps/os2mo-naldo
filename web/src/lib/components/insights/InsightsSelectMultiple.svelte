<script lang="ts">
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import SvelteSelect from "svelte-select"
  // Import the real type to ensure safety
  import type { Field } from "$lib/utils/insights"

  export let title: string | undefined = undefined
  export let id: string
  export let iterable: Field[] | [] | undefined = undefined
  export let name: string[] | undefined | null = undefined
  export let required = false
  export let placeholder: string = ""
  export let disabled = false
  export let extra_classes = ""
  export let multiple = true
  export let value: Field[] | undefined
  export let errors: string[] = []

  // SvelteSelect uses this to identify the object.
  const itemId = "label"

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
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
      --loading-height="1.5rem"
      --loading-width="1.5rem"
      --spinner-height="1.5rem"
      --spinner-width="1.5rem"
      --item-padding="0.25rem 0.75rem 0.25rem 0.75rem"
      --item-height="auto"
      --item-line-height="auto"
      --border-radius="0.25rem"
      --icons-color="#00244E"
      --padding="0.75rem 0.75rem"
      {id}
      name={id}
      {floatingConfig}
      {disabled}
      {itemId}
      showChevron={true}
      clearable={false}
      {placeholder}
      items={iterable}
      {multiple}
      searchable={false}
      clearFilterTextOnBlur={false}
      bind:value
      on:change
      on:input
      on:clear={() => {
        name = undefined
      }}
    >
      <div slot="item" let:item class="cursor-pointer">
        {capital($_(item.label, { values: { n: 1 } }))}
      </div>

      <div slot="selection" let:selection class="cursor-pointer">
        {capital($_(selection.label, { values: { n: 1 } }))}
      </div>
    </SvelteSelect>
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
