<script lang="ts">
  import { _ } from "svelte-i18n"
  import { tick } from "svelte"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import {
    pick,
    searchAddresses,
    type AddressSelection,
    type AdressevaelgerHit,
    type Narrowing,
  } from "$lib/utils/adressevaelger"
  import SvelteSelect from "svelte-select"
  import DarItem from "$lib/components/forms/shared/DARItem.svelte"

  export let startValue: { id: string; titel?: string | null } | undefined = undefined
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

  const itemId = "titel" // Used by the component to differentiate between items
  const endpoint = env.PUBLIC_DAR_ACCESS_ADDRESSES ? "husnumre" : "adresser"

  // `value` is what svelte-select shows, which can briefly be a narrowing hit,
  // so the form reads `selected` instead.
  let selected: AddressSelection | undefined = startValue?.titel
    ? { id: startValue.id, titel: startValue.titel }
    : undefined
  let value: AddressSelection | AdressevaelgerHit | undefined = selected
  let filterText = ""
  let input: HTMLInputElement | undefined
  let missing: Narrowing["missing"] | undefined
  let searchFailed = false

  $: if (selected) {
    darName = selected.titel
    darValue = { name: selected.titel, value: selected.id }
  }

  let abortController: AbortController | undefined
  const fetchDAR = async (filterText: string) => {
    abortController?.abort()
    abortController = new AbortController()
    const { signal } = abortController
    try {
      const hits = await searchAddresses(
        endpoint,
        filterText,
        env.PUBLIC_ADRESSEVAELGER_TOKEN,
        signal
      )
      searchFailed = false
      return hits
    } catch (err) {
      if (signal.aborted) return { cancelled: true } // superseded by a newer search
      console.error(err)
      searchFailed = true
      return []
    }
  }

  // svelte-select has already shown the hit as the value by now
  const handleSelect = async ({ detail: hit }: CustomEvent<AdressevaelgerHit>) => {
    const picked = pick(hit, endpoint)
    if ("id" in picked) {
      selected = picked
      missing = undefined
      return
    }
    value = selected
    missing = picked.missing
    filterText = picked.text
    await tick()
    input?.focus()
    input?.setSelectionRange(picked.caret, picked.caret)
  }

  const floatingConfig = {
    placement: "bottom-start",
    strategy: "fixed",
  }
</script>

<div class="pb-3">
  <div class="form-control w-full pb-1">
    {#if title || required}
      <label for="dar-search" class="text-sm text-base-content pb-1">
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
      bind:filterText
      bind:input
      on:select={handleSelect}
      on:clear
      on:clear={() => {
        selected = undefined
        missing = undefined
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
  {#if searchFailed}
    <span class="text-xs text-error">{capital($_("address_search_error"))}</span>
  {/if}
  {#each errors as error}
    {#if error === "required"}
      <span class="text-xs text-error"
        >{$_(missing ? `validation.missing_${missing}` : "validation.is_required", {
          values: { field: title },
        })}</span
      >
    {/if}
  {/each}
</div>

{#if selected}
  <input hidden name={id} value={selected.id} />
{/if}
