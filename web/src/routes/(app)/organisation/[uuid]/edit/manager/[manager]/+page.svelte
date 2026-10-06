<script lang="ts">
  import { isLaterEnd } from "$lib/utils/validities"
  import { Temporal } from "temporal-polyfill"
  import type { ValidityBounds } from "$lib/utils/validities"
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
  import {
    ManagerDocument,
    UpdateManagerDocument,
    GetEngagementsDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey, primaryClassUuid } from "$lib/utils/classes"
  import Search from "$lib/components/search/Search.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getPrimaryManagers, type PrimaryManager } from "$lib/http/getPrimaryManagers"
  import PrimaryManagerConflicts from "$lib/components/forms/entity/PrimaryManagerConflicts.svelte"
  import type { ClassValue } from "$lib/components/forms/entity/types"
  import { getClasses, getPrimaryClasses } from "$lib/http/getClasses"
  import { env } from "$lib/env"
  import { createQuery } from "$lib/http/query"
  import { getValidities } from "$lib/http/getValidities"
  import { normalizeManager } from "$lib/utils/normalizeForm"
  import {
    getEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
  } from "$lib/utils/display"

  gql`
    query Manager(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime
    ) {
      managers(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            person_response {
              uuid
              current(at: $currentDate) {
                name
              }
            }
            manager_type_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            manager_level_response {
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
            responsibilities_response {
              objects {
                uuid
                current(at: $fromDate) {
                  name
                  user_key
                }
              }
            }
            primary_response {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
            validity {
              from
              to
            }
            org_unit_response {
              uuid
              current(at: $currentDate) {
                name
                validity {
                  from
                  to
                }
              }
            }
            engagement_response {
              uuid
              current(at: $fromDate) {
                org_unit_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                job_function_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }

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
              uuid
              current(at: $fromDate) {
                user_key
                name
              }
            }
          }
        }
      }
    }

    mutation UpdateManager($input: ManagerUpdateInput!, $date: DateTime!) {
      manager_update(input: $input) {
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
  let selectedOrgUnit: {
    uuid: string
    name: string
  }
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
  let selectedPrimary: ClassValue | undefined

  const fromDate = field<Temporal.ZonedDateTime | null | undefined>("from", undefined, [
    required(),
  ])
  const orgUnit = field("org_unit", "", [required()])
  const managerType = field("manager_type", "", [required()])
  const managerLevel = field("manager_level", "", [required()])
  const responsibilitiesField = field("responsibilities", undefined, [required()])
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
    orgUnit,
    managerType,
    managerLevel,
    responsibilitiesField,
    primary
  )

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      await svelteForm.validate()
      if (!$svelteForm.valid) return
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(UpdateManagerDocument, {
          input: result.data,
          date: result.data.validity.from,
        })
        $success = {
          message: capital(
            $_("success_edit_item", {
              values: {
                item: $_("manager", { values: { n: 0 } }),
                name: mutation.manager_update.current?.person_response?.current?.name,
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

  // Datepicker bounds for the selected org unit. See the employee edit
  // engagement form for the query pattern and its trade-offs.
  const validities = createQuery<ValidityBounds>({ from: null, to: null })
  $: if (selectedOrgUnit?.uuid) {
    const orgUnitUuid = selectedOrgUnit.uuid
    validities.run((signal) => getValidities(orgUnitUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  $: primaryUuid = primaryClassUuid(selectedPrimary)
  $: primaryLookup = {
    orgUnit: selectedOrgUnit?.uuid,
    primary: primaryUuid,
    from: startDate,
    to: toDate,
    exclude: $page.params.manager,
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
          orgUuid: selectedOrgUnit?.uuid,
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

  // Created in the script (not inline in the {#await} tag) so the result can
  // be captured below without a side effect in the template.
  const managerPromise = graphQLClient().request(ManagerDocument, {
    uuid: $page.params.manager,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
    currentDate: startDate,
  })

  let initialManager: any = null
  managerPromise.then(
    (data) => {
      initialManager = normalizeManager(data.managers.objects[0].validities[0])
    },
    // The template's {#await} has no {:catch}, so a failed load stays on the
    // pending branch. This handler only prevents an unhandled rejection from
    // this second promise chain.
    () => {}
  )
  let hasChanges = false
  $: if (initialManager) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      selectedOrgUnit?.uuid !== initialManager.org_unit ||
      selectedPerson?.uuid !== initialManager.person ||
      $managerType.value !== initialManager.manager_type ||
      $managerLevel.value !== initialManager.manager_level ||
      JSON.stringify($responsibilitiesField.value) !==
        JSON.stringify(initialManager.responsibility) ||
      (selectedEngagement?.uuid ?? null) !== (initialManager.engagement ?? null) ||
      (env.PUBLIC_SHOW_PRIMARY_MANAGER &&
        (selectedPrimary?.uuid ?? null) !== initialManager.primary)

    const toDateExtended = isLaterEnd(toDate, initialManager.to)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("manager", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("manager", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await managerPromise}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const manager = data.managers.objects[0].validities[0]}
  {@const responsibilities = manager.responsibilities_response.objects.map((r) => ({
    uuid: r.uuid,
    name: r.current?.name ?? "",
    user_key: r.current?.user_key ?? "",
  }))}
  {@const engagementStartValue = manager.engagement_response
    ? getEngagementTitlesAndUuid([
        {
          uuid: manager.engagement_response.uuid,
          job_function_response: manager.engagement_response.current
            ?.job_function_response ?? {
            current: null,
          },
          org_unit_response: manager.engagement_response.current?.org_unit_response ?? {
            current: null,
          },
        },
      ])[0]
    : undefined}

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
            min={$validities.data?.from}
            max={toDate ? toDate : $validities.data?.to}
            required={true}
          />
          <EndDateInput
            bind:value={toDate}
            startValue={manager.validity.to}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value}
            max={$validities.data?.to}
          />
        </div>
        <Search
          type="org-unit"
          at={startDate}
          startValue={{
            uuid: manager.org_unit_response.uuid,
            name: manager.org_unit_response.current?.name ?? "",
          }}
          bind:value={selectedOrgUnit}
          bind:name={$orgUnit.value}
          errors={$orgUnit.errors}
          on:clear={() => ($orgUnit.value = "")}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <Search
          type="employee"
          at={startDate}
          bind:value={selectedPerson}
          startValue={manager.person_response
            ? {
                uuid: manager.person_response.uuid,
                name: manager.person_response.current?.name ?? "",
              }
            : undefined}
        />
        {#if $engagements.error}
          <p class="text-sm text-error">
            {capital(
              $_($engagements.data?.length ? "load_error_options" : "load_error")
            )}
          </p>
        {/if}
        <Select
          title={capital($_("engagement", { values: { n: 1 } }))}
          id="engagement-uuid"
          startValue={engagementStartValue}
          bind:value={selectedEngagement}
          iterable={$engagements.data?.length
            ? getEngagementTitlesAndUuid($engagements.data)
            : engagementStartValue
            ? [engagementStartValue]
            : []}
          isClearable={true}
          disabled={!$engagements.data?.length || $engagements.error}
        />
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
              startValue={{
                uuid: manager.manager_type_response?.uuid,
                name: manager.manager_type_response?.current?.name ?? "",
                user_key: manager.manager_type_response?.current?.user_key ?? "",
              }}
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
              startValue={{
                uuid: manager.manager_level_response?.uuid,
                name: manager.manager_level_response?.current?.name ?? "",
                user_key: manager.manager_level_response?.current?.user_key ?? "",
              }}
              bind:name={$managerLevel.value}
              errors={$managerLevel.errors}
              iterable={filterClassesByFacetUserKey($facets.data, "manager_level")}
              disabled={!startDate || $facets.error}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
          <SelectMultiple
            bind:name={$responsibilitiesField.value}
            errors={$responsibilitiesField.errors}
            title={capital($_("manager_responsibility"))}
            id="responsibility"
            startValue={responsibilities}
            iterable={filterClassesByFacetUserKey($facets.data, "responsibility")}
            disabled={!startDate || $facets.error}
            required={true}
          />
          {#if env.PUBLIC_SHOW_PRIMARY_MANAGER}
            <Select
              title={capital($_("primary"))}
              id="primary"
              startValue={manager.primary_response
                ? {
                    uuid: manager.primary_response.uuid,
                    name:
                      manager.primary_response.current?.name ??
                      manager.primary_response.uuid,
                    user_key: manager.primary_response.current?.user_key,
                  }
                : undefined}
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
          $_("edit_item", {
            values: { item: $_("manager", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
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
{/await}
