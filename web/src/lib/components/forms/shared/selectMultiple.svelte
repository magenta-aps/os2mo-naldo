<script lang="ts">
  import SvelteSelect from "svelte-select"
  export let title: string | undefined = undefined
  export let id: string
  export let iterable: any[] | undefined = undefined
  export let required = false
  export let placeholder: string = ""
  export let disabled = false
  export let multiple = false
  // TODO: Types needs to be fixed OVERALL
  export let startValue: any[] | undefined = undefined

  const itemId = "uuid" // Used by the component to differentiate between items

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="w-full pb-4 cursor-pointer">
  {#if title}
    <label for={id} class="text-sm text-secondary pb-1">
      {title}
    </label>
  {/if}
  <SvelteSelect
    --font-size="1rem"
    --height="2rem"
    --loading-height="1.5rem"
    --loading-width="1.5rem"
    --spinner-height="1.5rem"
    --spinner-width="1.5rem"
    --item-padding="0.25rem 0.75rem 0.25rem 0.75rem"
    --item-height="auto"
    --item-line-height="auto"
    --border-radius="0.25rem"
    --placeholder-color="#00244E"
    --icons-color="#00244E"
    --border-focused="solid 0px"
    --padding="0.75rem 0.75rem"
    {id}
    name={id}
    {floatingConfig}
    {required}
    {disabled}
    {itemId}
    showChevron={true}
    clearable={false}
    {placeholder}
    items={iterable}
    {multiple}
    searchable={false}
    value={startValue}
    on:change
    on:clear
  >
    <div slot="item" let:item class="cursor-pointer">
      {item.name}
    </div>

    <div slot="selection" let:selection class="cursor-pointer">
      {selection.name}
    </div>
  </SvelteSelect>
</div>

<style>
  :global(.svelte-select.focused) {
    box-shadow: 0px 0px 0px 3px #1053ab;
  }
</style>
