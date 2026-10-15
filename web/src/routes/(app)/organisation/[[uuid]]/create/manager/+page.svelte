<script lang="ts">
  import type { ValidityBounds } from "$lib/utils/validities"
  import { Temporal } from "temporal-polyfill"
  import { moValidityFrom } from "$lib/utils/date"
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import EndDateInput from "$lib/components/forms/shared/EndDateInput.svelte"
  import StartDateInput from "$lib/components/forms/shared/StartDateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import type { FacetValidities } from "$lib/utils/classes"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { CreateManagerDocument, GetEngagementsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey, primaryClassUuid } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getPrimaryManagers, type PrimaryManager } from "$lib/http/getPrimaryManagers"
  import PrimaryManagerConflicts from "$lib/components/forms/entity/PrimaryManagerConflicts.svelte"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import { createQuery } from "$lib/http/query"
  import { getClasses, getPrimaryClasses } from "$lib/http/getClasses"
  import { env } from "$lib/env"
  import {
    formatEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
  } from "$lib/utils/helpers"

  gql`
    query GetEngagements($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      engagements(
        filter: { employees: $uuid, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            uuid
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

    mutation CreateManager($input: ManagerCreateInput!, $date: DateTime!) {
      manager_create(input: $input) {
        current(at: $date) {
          person_response {
            uuid
            current(at: $date) {
              name
            }
          }
        }
      }
    }
  `

  let startDate: Temporal.ZonedDateTime | null | undefined = moValidityFrom($date)
  let toDate: Temporal.ZonedDateTime | null | undefined
  let selectedPerson: {
    uuid: string
    name: string
  }
  let selectedEngagement:
    | {
        uuid: string
        name: string
      }
    | undefined
  // Forces a conscious choice: either pick an engagement or actively
  // confirm there is none.
  let noEngagement = false

  const fromDate = field<Temporal.ZonedDateTime | null | undefined>("from", undefined, [
    required(),
  ])
  const managerType = field("manager_type", "", [required()])
  const managerLevel = field("manager_level", "", [required()])
  const responsibilities = field("responsibilities", undefined, [required()])
  const engagement = field("engagement", "", [
    () => ({ valid: noEngagement || !!selectedEngagement?.uuid, name: "required" }),
  ])
  let selectedPrimary: ClassValue | undefined
  const primaryManagers = createQuery<PrimaryManager[]>([])
  // Queries MO again on submit: the lookup shown under the select may still be
  // loading, or another user may have set a primary manager since. A failed
  // query blocks too.
  const primary = field("primary", "", [
    async () => {
      const found = await getPrimaryManagers(primaryLookup).catch(() => null)
      return found
        ? { valid: !found.length, name: "primary_manager_taken" }
        : { valid: false, name: "load_error" }
    },
  ])
  const svelteForm = form(
    fromDate,
    managerType,
    managerLevel,
    responsibilities,
    engagement,
    primary
  )

  // Clear any selected engagement when the user opts out.
  $: if (noEngagement && selectedEngagement) selectedEngagement = undefined

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(CreateManagerDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_create_item", {
              values: {
                item: $_("manager", { values: { n: 0 } }),
                name: mutation.manager_create.current?.person_response?.current?.name,
              },
            })
          ),
          uuid: $page.params.uuid,
          type: "organisation",
        }
      } catch (err) {
        $error = { message: err }
      }
    }

  // Logic for updating datepicker intervals
  let validities: ValidityBounds = { from: null, to: null }

  $: primaryUuid = primaryClassUuid(selectedPrimary)
  $: primaryLookup = {
    orgUnit: $page.params.uuid,
    primary: primaryUuid,
    from: startDate,
    to: toDate,
  }
  $: {
    // A submit-time error belongs to the inputs it checked.
    primary.reset()
    primaryManagers.run((signal) => getPrimaryManagers(primaryLookup, signal))
  }

  const primaryClasses = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: the query rejects a null date, and
  // the primary select is disabled without one anyway.
  $: if (env.PUBLIC_SHOW_PRIMARY_MANAGER && startDate) {
    const at = startDate
    primaryClasses.run((signal) =>
      getPrimaryClasses(
        { fromDate: at, primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY },
        signal
      )
    )
  }

  const facets = createQuery<FacetValidities[]>()
  // Only fetch when a start date is set: getClasses rejects a null date, and
  // the facet selects are disabled without one anyway.
  $: if (startDate) {
    const at = startDate
    facets.run((signal) =>
      getClasses(
        {
          currentDate: at,
          orgUuid: $page.params.uuid,
          facetUserKeys: ["manager_type", "manager_level", "responsibility"],
        },
        signal
      )
    )
  }

  const engagements = createQuery<EngagementTitleAndUuid[]>([])
  $: personUuid = selectedPerson?.uuid
  $: if (personUuid) {
    const fetchUuid = personUuid
    engagements.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetEngagementsDocument, {
        uuid: fetchUuid,
        fromDate: startDate,
        toDate: toDate || null,
      })
      return res.engagements?.objects.map((e) => e.validities[0]) ?? []
    })
  } else {
    engagements.run(async () => [])
  }
  // Outside the block above: a bound Select's variable assigned in a reactive
  // block makes the binding invalidate the block's dependencies, the dates too.
  $: if (!personUuid) selectedEngagement = undefined
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("manager", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("manager", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <StartDateInput
          bind:value={startDate}
          bind:validationValue={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={validities.from}
          max={toDate ? toDate : validities.to}
          required={true}
        />
        <EndDateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
      </div>
      <Search type="employee" at={startDate} bind:value={selectedPerson} />
      {#if $engagements.error}
        <p class="text-sm text-error">
          {capital($_($engagements.data?.length ? "load_error_options" : "load_error"))}
        </p>
      {/if}
      <Select
        title={capital($_("engagement", { values: { n: 1 } }))}
        id="engagement-uuid"
        bind:value={selectedEngagement}
        errors={$engagement.errors}
        iterable={$engagements.data?.length
          ? formatEngagementTitlesAndUuid($engagements.data)
          : []}
        isClearable={true}
        disabled={!$engagements.data?.length || $engagements.error || noEngagement}
        required={!noEngagement}
        on:change={() => engagement.validate()}
      />
      <div class="-mt-2">
        <Checkbox
          title={capital($_("no_engagement"))}
          id="no-engagement"
          value="true"
          bind:checked={noEngagement}
          on:change={() => engagement.validate()}
        />
      </div>
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
            id="manager-type"
            bind:name={$managerType.value}
            errors={$managerType.errors}
            iterable={filterClassesByFacetUserKey($facets.data, "manager_type")}
            disabled={!startDate || $facets.error}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title={capital($_("manager_level"))}
            id="manager-level"
            bind:name={$managerLevel.value}
            errors={$managerLevel.errors}
            iterable={filterClassesByFacetUserKey($facets.data, "manager_level")}
            disabled={!startDate || $facets.error}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <SelectMultiple
          bind:name={$responsibilities.value}
          errors={$responsibilities.errors}
          title={capital($_("manager_responsibility"))}
          id="responsibility"
          iterable={filterClassesByFacetUserKey($facets.data, "responsibility")}
          disabled={!startDate || $facets.error}
          required={true}
        />
        {#if env.PUBLIC_SHOW_PRIMARY_MANAGER}
          <Select
            title={capital($_("primary"))}
            id="primary"
            bind:value={selectedPrimary}
            iterable={$primaryClasses.data
              ? filterClassesByFacetUserKey($primaryClasses.data, "primary_type")
              : undefined}
            disabled={!startDate || $primaryClasses.error}
            isClearable={true}
            errors={$primaryManagers.data?.length
              ? ["primary_manager_taken"]
              : $primary.errors}
          />
          <PrimaryManagerConflicts
            managers={$primaryManagers.data}
            loadError={$primaryManagers.error || $primaryClasses.error}
            errors={$primary.errors}
          />
        {/if}
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("manager", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      href="{base}/organisation/{$page.params.uuid}"
    />
  </div>
  <Error />
</form>
