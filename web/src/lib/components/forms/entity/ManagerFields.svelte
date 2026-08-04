<script lang="ts">
  import { _ } from "svelte-i18n"
  import { get } from "svelte/store"
  import { capital } from "$lib/utils/helpers"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/http/client"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
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
  import {
    formatEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
  } from "$lib/utils/helpers"
  import { GetEngagementsDocument } from "./query.generated"
  import type { ManagerValues } from "$lib/components/forms/entity/types"

  gql`
    query GetEngagements($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      engagements(
        filter: { employees: $uuid, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            uuid
            person_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            org_unit_response {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
            job_function_response {
              current(at: $fromDate) {
                user_key
                name
              }
            }
          }
        }
      }
    }
  `

  // Shared field group: renders the manager fields for both the create route
  // and the userflow wizard. See types.ts for the contract.
  export let value: ManagerValues
  // The route passes the page's person; enables the engagement-link block
  // (person display, engagement select, no_engagement checkbox). The wizard
  // omits it — a wizard manager is the new employee, whose engagements are
  // created in the same mutation and cannot be referenced yet.
  export let personUuid: string | undefined = undefined
  // De-duplicates DOM ids when several instances are mounted (wizard tabs).
  export let idPrefix = ""

  // Engagement-link state; only used when personUuid is set.
  let selectedEngagement: { uuid: string; name: string } | undefined
  let selectedPerson: { uuid: string; name: string }
  // Forces a conscious choice: either pick an engagement or actively
  // confirm there is none.
  let noEngagement = false

  // svelte-forms' required() passes an empty array, and SelectMultiple syncs
  // its (empty) bound value onto the field at mount — so responsibilities
  // need a list-aware rule to actually demand a selection.
  const requiredList = () => (val: unknown) => ({
    valid: Array.isArray(val) ? val.length > 0 : val !== undefined && val !== null,
    name: "required",
  })

  // Fields are seeded from the bound value: on a wizard tab remount the
  // facet-gated selects only sync their names once the classes load, and
  // validation must not depend on that round-trip.
  const fromDateField = field("from", "", [required()])
  const orgUnitField = field("org_unit", value.orgUnit?.name ?? "", [required()])
  const managerTypeField = field("manager_type", value.managerType?.name ?? "", [
    required(),
  ])
  const managerLevelField = field("manager_level", value.managerLevel?.name ?? "", [
    required(),
  ])
  const responsibilitiesField = field(
    "responsibilities",
    value.responsibilities.length
      ? value.responsibilities.map((responsibility) => responsibility.name)
      : undefined,
    [requiredList()]
  )
  const engagementField = field("engagement", "", [
    // Hidden block (no personUuid) always passes.
    () => ({
      valid: !personUuid || noEngagement || !!selectedEngagement?.uuid,
      name: "required",
    }),
  ])
  const svelteForm = form(
    fromDateField,
    orgUnitField,
    managerTypeField,
    managerLevelField,
    responsibilitiesField,
    engagementField
  )

  export const validate = async (): Promise<boolean> => {
    await svelteForm.validate()
    return get(svelteForm).valid
  }

  // Clear any selected engagement when the user opts out.
  $: if (noEngagement && selectedEngagement) selectedEngagement = undefined

  // Everything lives on one bound object; project the reactive keys out as
  // primitives so unrelated keystrokes don't refire the blocks below.
  $: fromDate = value.fromDate
  $: toDate = value.toDate
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
          facetUserKeys: ["manager_type", "manager_level", "responsibility"],
        },
        signal
      )
    )
  }

  const engagements = createQuery<EngagementTitleAndUuid[]>()
  $: if (personUuid && fromDate) {
    const uuid = personUuid
    const from = fromDate
    const to = toDate
    engagements.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetEngagementsDocument, {
        uuid: uuid,
        fromDate: from,
        toDate: to,
      })
      return res.engagements?.objects.map((e) => e.validities[0]) ?? []
    })
  }

  $: if ($engagements.data?.[0]?.person_response && !selectedPerson) {
    selectedPerson = {
      uuid: $engagements.data[0].person_response.uuid,
      name: $engagements.data[0].person_response.current?.name ?? "",
    }
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
{#if personUuid}
  <Search type="employee" bind:value={selectedPerson} disabled required={true} />
  {#if $engagements.error}
    <p class="text-sm text-error">
      {capital($_($engagements.data ? "load_error_options" : "load_error"))}
    </p>
  {/if}
  <Select
    title={capital($_("engagement", { values: { n: 1 } }))}
    id="{idPrefix}engagement-uuid"
    bind:value={selectedEngagement}
    errors={$engagementField.errors}
    iterable={$engagements.data ? formatEngagementTitlesAndUuid($engagements.data) : []}
    isClearable={true}
    disabled={!$engagements.data?.length || $engagements.error || noEngagement}
    required={!noEngagement}
    on:change={() => engagementField.validate()}
  />
  <div class="-mt-2">
    <Checkbox
      title={capital($_("no_engagement"))}
      id="{idPrefix}no-engagement"
      value="true"
      bind:checked={noEngagement}
      on:change={() => engagementField.validate()}
    />
  </div>
{/if}
{#if $facets.loading && !$facets.data}
  <div class="flex flex-row gap-6">
    <Skeleton extra_classes="basis-1/2" />
    <Skeleton extra_classes="basis-1/2" />
  </div>
  <Skeleton />
{/if}
{#if $facets.error}
  <p class="text-sm text-error">
    {capital($_($facets.data ? "load_error_options" : "load_error"))}
  </p>
{/if}
{#if $facets.data}
  <div class="flex flex-row gap-6">
    <Select
      title={capital($_("manager_type"))}
      id="{idPrefix}manager-type"
      bind:value={value.managerType}
      bind:name={$managerTypeField.value}
      errors={$managerTypeField.errors}
      iterable={filterClassesByFacetUserKey($facets.data, "manager_type")}
      disabled={!value.fromDate || $facets.error}
      extra_classes="basis-1/2"
      required={true}
    />
    <Select
      title={capital($_("manager_level"))}
      id="{idPrefix}manager-level"
      bind:value={value.managerLevel}
      bind:name={$managerLevelField.value}
      errors={$managerLevelField.errors}
      iterable={filterClassesByFacetUserKey($facets.data, "manager_level")}
      disabled={!value.fromDate || $facets.error}
      extra_classes="basis-1/2"
      required={true}
    />
  </div>
  <SelectMultiple
    bind:value={value.responsibilities}
    bind:name={$responsibilitiesField.value}
    errors={$responsibilitiesField.errors}
    on:clear={() => ($responsibilitiesField.value = undefined)}
    title={capital($_("manager_responsibility"))}
    id="{idPrefix}responsibility"
    iterable={filterClassesByFacetUserKey($facets.data, "responsibility")}
    disabled={!value.fromDate || $facets.error}
    required={true}
  />
{/if}
