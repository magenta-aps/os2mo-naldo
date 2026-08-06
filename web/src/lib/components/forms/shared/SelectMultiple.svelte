<script lang="ts">
  import { _ } from "svelte-i18n"
  import SvelteSelect from "svelte-select"
  import { afterUpdate } from "svelte"

  type Value = {
    uuid: string | null
    name: string
    user_key?: string | null
  }
  export let title: string | undefined = undefined
  export let id: string
  export let iterable: Value[] | undefined = undefined
  export let name: string[] | undefined | null = undefined
  export let required = false
  export let placeholder: string = ""
  export let disabled = false
  export let startValue: Value[] | undefined = undefined
  export let value: Value[] | undefined = startValue || undefined
  export let errors: string[] = []

  $: if (value) {
    name = value.map((val) => val.name)
  }

  // Mirrors Select: when the options update and a selected item is no longer one
  // of them, drop it. Done in afterUpdate (not a reactive $:) and deferred with a
  // setTimeout, so the change lands on a clean tick rather than looping with
  // svelte-select's internal value handling. Guarded on a non-empty list so an
  // as-yet-unloaded (empty) iterable can't wipe a startValue selection.
  afterUpdate(() => {
    if (
      value &&
      iterable?.length &&
      value.some((val) => !iterable?.some((item) => item.uuid === val.uuid))
    ) {
      setTimeout(() => {
        value = value?.filter((val) => iterable?.some((item) => item.uuid === val.uuid))
      }, 1)
    }
  })

  const itemId = "uuid" // Used by the component to differentiate between items

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="pb-3">
  <div class="form-control w-full pb-1">
    {#if title || required}
      <label for={id} class="text-sm text-base-content pb-1">
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
      multiple={true}
      searchable={false}
      hasError={errors.length ? true : false}
      clearFilterTextOnBlur={false}
      bind:value
      on:change
      on:clear={() => {
        name = undefined
      }}
    >
      <div slot="item" let:item class="cursor-pointer">
        {item.name}
      </div>

      <div slot="selection" let:selection class="cursor-pointer">
        {selection.name}
      </div>
    </SvelteSelect>
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="text-xs text-error"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>
