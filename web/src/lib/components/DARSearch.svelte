<script lang="ts">
  import { env } from "$env/dynamic/public"
  import SvelteSelect from "svelte-select"
  import DarItem from "./DARItem.svelte"

  export let startValue: DarAddressResponse | undefined = undefined
  export let value: DarAddressResponse | undefined = startValue || undefined
  export let title: string
  export let darName: string | undefined | null = undefined
  export let id = `value`
  export let required = true
  export let disabled = false
  export let errors: string[] = []

  // :(
  $: if (value?.tekst) {
    darName = value.tekst
  }

  const itemId = "tekst" // Used by the component to differentiate between items
  const url = env.PUBLIC_DAR_ACCESS_ADDRESSES ? "adgangsadresser" : "adresser"

  const fetchDAR = async (filterText: string) => {
    if (!filterText.length) return []
    if (filterText.length < 2) return []
    try {
      const res = await fetch(
        `https://api.dataforsyningen.dk/${url}/autocomplete/?q=${filterText}&global=1`
      )
      return (await res.json()) as Autocomplete[]
    } catch (err) {
      console.error(err)
    }
  }

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="pb-3">
  <div class="form-control w-full pb-1">
    {#if title || required}
      <label for="dar-search" class="text-sm text-secondary pb-1">
        {title ? title : ""}
        {required ? "*" : ""}
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
      --clear-select-height="1.5rem"
      --clear-select-width="1.5rem"
      --value-container-padding="0rem"
      --border-radius="0.25rem"
      --placeholder-color="#00244E"
      --icons-color="#00244E"
      --border-focused="solid 0px"
      --padding="0 0 0 0.75rem"
      placeholder="Søg efter adresse"
      id="dar-search"
      listAutoWidth={false}
      loadOptions={fetchDAR}
      {floatingConfig}
      {disabled}
      {itemId}
      bind:value
      on:clear={() => {
        darName = undefined
      }}
      hideEmptyState={true}
    >
      <div slot="item" let:item>
        <DarItem {item} />
      </div>

      <div slot="selection" let:selection>
        <DarItem item={selection} />
      </div>
    </SvelteSelect>
  </div>
  {#each errors as error}
    {#if error === "required"}
      <span class="label-text-alt text-error block">{title} skal udfyldes</span>
    {/if}
  {/each}
</div>

{#if value}
  {#if env.PUBLIC_DAR_ACCESS_ADDRESSES}
    <input hidden name={id} bind:value={value.adgangsadresse.id} />
  {:else}
    <input hidden name={id} bind:value={value.adresse.id} />
  {/if}
{/if}

<style>
  :global(.svelte-select.focused) {
    box-shadow: 0px 0px 0px 3px #1053ab;
  }
</style>
