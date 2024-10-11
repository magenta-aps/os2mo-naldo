<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { env } from "$env/dynamic/public"
  import SvelteSelect from "svelte-select"
  import DarItem from "$lib/components/DARItem.svelte"

  export let startValue: DarAddressResponse | undefined = undefined
  export let value: DarAddressResponse | undefined = startValue || undefined
  export let title: string
  export let darName: string | undefined | null = undefined
  export let darValue: { name?: string; value: string } | string = {
    name: undefined,
    value: "",
  }
  export let id = `value`
  export let required = true
  export let disabled = false
  export let errors: string[] = []

  const itemId = "tekst" // Used by the component to differentiate between items
  const url = env.PUBLIC_DAR_ACCESS_ADDRESSES ? "adgangsadresser" : "adresser"

  $: if (value?.tekst) {
    darName = value.tekst
    darValue = {
      name: value.tekst,
      value: value.adgangsadresse?.id ? value.adgangsadresse.id : value.adresse.id,
    }
  }

  const fetchDAR = async (filterText: string) => {
    if (!filterText.length) return []
    if (filterText.length < 3) return []
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
      --icons-color="#00244E"
      --padding="0 0.75rem 0 0.75rem"
      placeholder={capital($_("search_for.address"))}
      id="dar-search"
      listAutoWidth={false}
      loadOptions={fetchDAR}
      hasError={errors.length ? true : false}
      clearFilterTextOnBlur={false}
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
      <span class="label-text-alt text-error block"
        >{$_("validation.is_required", { values: { field: title } })}</span
      >
    {/if}
  {/each}
</div>

{#if value}
  {#if env.PUBLIC_DAR_ACCESS_ADDRESSES && "adgangsadresse" in value}
    <input hidden name={id} bind:value={value.adgangsadresse.id} />
  {:else if "adresse" in value}
    <input hidden name={id} bind:value={value.adresse.id} />
  {/if}
{/if}
