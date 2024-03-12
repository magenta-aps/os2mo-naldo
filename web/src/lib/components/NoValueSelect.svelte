<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import SvelteSelect from "svelte-select"

  type Operation = { operation: string; filter: string; value: string; n: number }

  export let title: string | undefined = undefined
  export let id: string
  export let iterable: Operation[]

  export let required = false
  export let placeholder: string = ""
  export let disabled = false
  export let startValue: Operation | undefined = undefined
  export let value: Operation | undefined = startValue || undefined
  export let isClearable: boolean | undefined = false
  export let extra_classes = ""
  export let errors: string[] = []
  export let searchable: boolean = false

  const itemId = "value" // Used by the component to differentiate between items

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="pb-3 {extra_classes}">
  <div class="form-control w-full pb-1 text-secondary">
    {#if title || required}
      <label for={id} class="text-sm pb-1">
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
      items={iterable}
      {searchable}
      clearFilterTextOnBlur={false}
      bind:value
      on:change
      on:clear
    >
      <div slot="item" let:item class="cursor-pointer">
        {capital($_(item.value, { values: { n: item.n } }))}
      </div>

      <div slot="selection" let:selection class="cursor-pointer">
        {capital($_(selection.value, { values: { n: selection.n } }))}
      </div>
    </SvelteSelect>
  </div>
  {#if value}
    <input hidden {id} name={id} bind:value={value.value} />
  {/if}
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
