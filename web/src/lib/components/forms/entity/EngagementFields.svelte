<script lang="ts">
  import { _ } from "svelte-i18n"
  import { get } from "svelte/store"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { createQuery } from "$lib/http/query"
  import { getClasses } from "$lib/http/getClasses"
  import { getValidities } from "$lib/http/getValidities"
  import type { EngagementValues } from "$lib/components/forms/entity/types"

  // Shared field group: renders the engagement fields for both the create
  // route (formData submission via the inputs' canonical names) and the
  // userflow wizard (a bound store item). See types.ts for the contract.
  export let value: EngagementValues
  // De-duplicates DOM ids when several instances are mounted (wizard tabs).
  // Input names derive from ids, but only the route (idPrefix="") submits
  // formData, so prefixed names are harmless.
  export let idPrefix = ""

  // Fields are seeded from the bound value: on a wizard tab remount the
  // facet-gated selects only sync their names once the classes load, and
  // validation must not depend on that round-trip.
  const fromDateField = field("from", "", [required()])
  const orgUnitField = field("org_unit", value.orgUnit?.name ?? "", [required()])
  const jobFunctionField = field("job_function", value.jobFunction?.name ?? "", [
    required(),
  ])
  const engagementTypeField = field(
    "engagement_type",
    value.engagementType?.name ?? "",
    [required()]
  )
  const svelteForm = form(
    fromDateField,
    orgUnitField,
    jobFunctionField,
    engagementTypeField
  )

  export const validate = async (): Promise<boolean> => {
    await svelteForm.validate()
    return get(svelteForm).valid
  }

  // Everything lives on one bound object, so any keystroke invalidates
  // `value` as a whole. Project the query keys out as primitives first:
  // reassigning an unchanged primitive doesn't propagate, so the query
  // blocks below only re-run when their actual inputs change.
  $: fromDate = value.fromDate
  $: orgUnitUuid = value.orgUnit?.uuid

  // Datepicker bounds for the selected org unit. See the employee edit
  // engagement form for the query pattern and its trade-offs.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (orgUnitUuid) {
    const uuid = orgUnitUuid
    validities.run((signal) => getValidities(uuid, signal))
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
          orgUuid: orgUnitUuid ?? null,
          facetUserKeys: ["engagement_type", "engagement_job_function", "primary_type"],
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
<Search
  type="org-unit"
  at={value.fromDate}
  bind:name={$orgUnitField.value}
  errors={$orgUnitField.errors}
  on:clear={() => ($orgUnitField.value = "")}
  bind:value={value.orgUnit}
  id="{idPrefix}org-unit-uuid"
  required={true}
/>
<Breadcrumbs orgUnit={value.orgUnit} />

{#if $facets.loading && !$facets.data}
  <div class="flex flex-row gap-6">
    <Skeleton extra_classes="basis-1/2" />
    <Skeleton extra_classes="basis-1/2" />
  </div>
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
    <Input
      title="ID"
      id="{idPrefix}user-key"
      bind:value={value.user_key}
      extra_classes="basis-1/2"
    />
    <Select
      title={env.PUBLIC_SHOW_EXTENSION_1
        ? capital($_("job_code"))
        : capital($_("job_function", { values: { n: 1 } }))}
      id="{idPrefix}job-function"
      bind:value={value.jobFunction}
      bind:name={$jobFunctionField.value}
      errors={$jobFunctionField.errors}
      iterable={filterClassesByFacetUserKey($facets.data, "engagement_job_function")}
      disabled={!value.fromDate || $facets.error}
      required={true}
      extra_classes="basis-1/2"
    />
  </div>
  {#if env.PUBLIC_SHOW_EXTENSION_1 || env.PUBLIC_SHOW_EXTENSION_4}
    <div class="flex flex-row gap-6">
      {#if env.PUBLIC_SHOW_EXTENSION_1}
        <Input
          title={capital($_("job_function", { values: { n: 1 } }))}
          id="{idPrefix}extension-1"
          bind:value={value.extension1}
          extra_classes="basis-1/2"
        />
      {/if}
      {#if env.PUBLIC_SHOW_EXTENSION_4}
        <Input
          title={capital($_("department_code"))}
          id="{idPrefix}extension-4"
          bind:value={value.extension4}
          extra_classes="basis-1/2"
        />
      {/if}
    </div>
  {/if}
  <div class="flex flex-row gap-6">
    <Select
      title={capital($_("engagement_type"))}
      id="{idPrefix}engagement-type"
      bind:value={value.engagementType}
      bind:name={$engagementTypeField.value}
      errors={$engagementTypeField.errors}
      iterable={filterClassesByFacetUserKey($facets.data, "engagement_type")}
      disabled={!value.fromDate || $facets.error}
      required={true}
      extra_classes="basis-1/2"
    />
    <Select
      title={capital($_("primary"))}
      id="{idPrefix}primary"
      bind:value={value.primary}
      iterable={filterClassesByFacetUserKey($facets.data, "primary_type")}
      disabled={!value.fromDate || $facets.error}
      extra_classes="basis-1/2"
      isClearable={true}
    />
  </div>
{/if}
