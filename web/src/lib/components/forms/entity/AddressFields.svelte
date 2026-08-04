<script lang="ts">
  import { _ } from "svelte-i18n"
  import { get } from "svelte/store"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import DarSearch from "$lib/components/forms/shared/DARSearch.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { form, field } from "svelte-forms"
  import { required, email, pattern } from "svelte-forms/validators"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { createQuery } from "$lib/http/query"
  import { getClasses } from "$lib/http/getClasses"
  import { getPersonValidities } from "$lib/http/getValidities"
  import type { AddressValues } from "$lib/components/forms/entity/types"

  // Shared by the address create route and the userflow wizard; see types.ts.
  export let value: AddressValues
  // Route-only: the wizard's person does not exist yet, so its bounds stay open.
  export let personUuid: string | undefined = undefined
  // De-duplicates DOM ids when several instances are mounted (wizard tabs).
  export let idPrefix = ""

  // Seeded from the bound value: validation must not wait for the facet-gated
  // select to sync its name after the classes load.
  const fromDateField = field("from", "", [required()])
  const addressTypeField = field("address_type", value.addressType?.name ?? "", [
    required(),
  ])
  let addressField = field("", "")
  $: svelteForm = form(fromDateField, addressTypeField, addressField)

  export const validate = async (): Promise<boolean> => {
    await svelteForm.validate()
    return get(svelteForm).valid
  }

  // Projected to primitives so unrelated keystrokes don't refire the blocks below.
  $: fromDate = value.fromDate
  $: addressTypeUuid = value.addressType?.uuid
  $: addressTypeScope = value.addressType?.scope
  $: addressTypeName = value.addressType?.name

  // Catches Select dropping a class that is no longer valid at the chosen date,
  // which fires no on:change. Must read value.addressType, not the projection
  // above: depending on a `value`-derived primitive while writing `value` is a
  // reactive cycle Svelte rejects.
  let lastAddressTypeUuid = value.addressType?.uuid
  $: if (value.addressType?.uuid !== lastAddressTypeUuid) {
    lastAddressTypeUuid = value.addressType?.uuid
    value.addressValue = { name: "", value: "" }
  }

  // Keyed on scope, not name: the name is customer-configurable, so matching on
  // it drops custom-named types into the default branch.
  $: {
    switch (addressTypeScope) {
      case "EMAIL":
        addressField = field(addressTypeName ?? "", "", [required(), email()])
        break
      case "PHONE":
        addressField = field(addressTypeName ?? "", "", [
          required(),
          pattern(/^\+?\d+$/),
        ])
        break
      default:
        // No type selected yet → empty field; otherwise (DAR, TEXT and any
        // other scope): value required only.
        addressField = addressTypeName
          ? field(addressTypeName, "", [required()])
          : field("", "")
        break
    }
  }

  // Datepicker bounds for the person. See the employee edit engagement form
  // for the query pattern and its trade-offs.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (personUuid) {
    const uuid = personUuid
    validities.run((signal) => getPersonValidities(uuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: getClasses rejects a null date, and
  // the facet selects are disabled without one anyway.
  $: if (fromDate) {
    facets.run((signal) =>
      getClasses(
        {
          currentDate: fromDate,
          orgUuid: null,
          facetUserKeys: ["employee_address_type", "visibility"],
        },
        signal
      )
    )
  }
</script>

<div class="flex flex-row gap-6">
  <DateInput
    bind:value={value.fromDate}
    bind:validationValue={$fromDateField.value}
    errors={$fromDateField.errors}
    title={capital($_("date.start_date"))}
    id="{idPrefix}from"
    min={$validities.data?.from}
    max={value.toDate ? value.toDate : $validities.data?.to}
    required={true}
  />
  <DateInput
    bind:value={value.toDate}
    title={capital($_("date.end_date"))}
    id="{idPrefix}to"
    min={$fromDateField.value ? $fromDateField.value : $validities.data?.from}
    max={$validities.data?.to}
  />
</div>
{#if $facets.loading && !$facets.data}
  <div class="flex flex-row gap-6">
    <Skeleton extra_classes="basis-1/2" />
    <Skeleton extra_classes="basis-1/2" />
  </div>
{/if}
{#if $facets.error}
  <p class="text-sm text-error">
    {capital($_($facets.data ? "load_error_options" : "load_error"))}
  </p>
{/if}
{#if $facets.data}
  <div class="flex flex-row gap-6">
    <Select
      title={capital($_("visibility"))}
      id="{idPrefix}visibility"
      bind:value={value.visibility}
      iterable={filterClassesByFacetUserKey($facets.data, "visibility")}
      disabled={!value.fromDate || $facets.error}
      extra_classes="basis-1/2"
      isClearable={true}
    />
    <Select
      title={capital($_("address_type"))}
      id="{idPrefix}address-type"
      bind:value={value.addressType}
      bind:name={$addressTypeField.value}
      errors={$addressTypeField.errors}
      iterable={filterClassesByFacetUserKey($facets.data, "employee_address_type")}
      disabled={!value.fromDate || $facets.error}
      extra_classes="basis-1/2"
      required={true}
    />
    <input hidden name="{idPrefix}address-type-uuid" value={addressTypeUuid} />
  </div>
{/if}
<Input
  title={capital($_("description"))}
  id="{idPrefix}user-key"
  bind:value={value.user_key}
/>
{#if value.addressType}
  {#if value.addressType.scope === "DAR"}
    <DarSearch
      title={value.addressType.name}
      id="{idPrefix}value"
      startValue={value.addressValue?.value
        ? {
            tekst: value.addressValue.name,
            adresse: { id: value.addressValue.value },
            adgangsadresse: { id: value.addressValue.value },
          }
        : undefined}
      bind:darValue={value.addressValue}
      bind:darName={$addressField.value}
      errors={$addressField.errors}
      on:clear={() => (value.addressValue = { name: undefined, value: "" })}
      required={true}
    />
  {:else}
    <Input
      title={value.addressType.name}
      id="{idPrefix}value"
      bind:value={value.addressValue.value}
      bind:cprName={$addressField.value}
      errors={$addressField.errors}
      required={true}
    />
  {/if}
{/if}
