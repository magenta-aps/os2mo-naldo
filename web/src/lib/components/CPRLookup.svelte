<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import SvelteSelect from "svelte-select"
  import { cprLookup } from "$lib/util/helpers"
  import CprItem from "./CPRItem.svelte"

  export let startValue: CprLookupResponse | undefined = undefined
  export let value: CprLookupResponse | undefined | null = startValue || undefined
  export let title: string
  export let cprNumber: string | undefined = undefined
  export let id = `value`
  export let required = true
  export let disabled = false
  export let errors: string[] = []

  $: if (value?.cpr_no) {
    cprNumber = value.cpr_no
  }
  const itemId = "cpr_no" // Used by the component to differentiate between items

  const fetchCPR = async (filterText: string) => {
    if (!filterText.length) return []
    if (filterText.length < 10 || filterText.length > 10) return []
    // TODO: ERROR HANDLING
    // This doesn't `catch` http 500..
    try {
      return cprLookup(filterText)
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
      <label for="cpr-lookup" class="text-sm text-secondary pb-1">
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
      placeholder={capital($_("enter_cpr"))}
      id="cpr-lookup"
      listAutoWidth={false}
      loadOptions={fetchCPR}
      hasError={errors.length ? true : false}
      clearFilterTextOnBlur={false}
      {floatingConfig}
      {disabled}
      {itemId}
      bind:value
      on:clear={() => (cprNumber = undefined)}
      hideEmptyState={true}
    >
      <div slot="item" let:item>
        <CprItem {item} slot="item" />
      </div>

      <div slot="selection" let:selection>
        <CprItem item={selection} slot="selection" />
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
  <input hidden name={id} bind:value={value.cpr_no} />
{/if}
