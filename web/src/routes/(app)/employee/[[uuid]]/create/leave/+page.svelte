<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { findClosestValidity } from "$lib/utils/validities"
  import {
    CreateLeaveDocument,
    GetEmployeeDocument,
    GetEngagementsDocument,
  } from "./query.generated"
  import {
    formatEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
  } from "$lib/utils/helpers"
  import type { FacetValidities } from "$lib/utils/classes"
  import { createQuery } from "$lib/http/query"
  import { getEngagementValidities } from "$lib/http/getValidities"
  import { getClasses } from "$lib/http/getClasses"
  import Search from "$lib/components/search/Search.svelte"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  gql`
    query GetEmployee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          validities {
            uuid
            name
            validity {
              from
              to
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
            org_unit_response {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
            uuid
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

    mutation CreateLeave($input: LeaveCreateInput!, $date: DateTime!) {
      leave_create(input: $input) {
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

  let startDate: string = $date
  let toDate: string

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  let selectedEngagement: {
    uuid: string
    name: string
  }
  let selectedPerson: {
    uuid: string
    name: string
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateLeaveDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("leave", { values: { n: 0 } }),
                    name: mutation.leave_create.current?.person_response?.current?.name,
                  },
                })
              ),
              uuid: mutation.leave_create.current?.person_response?.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  // Datepicker bounds for the selected engagement. See the employee edit
  // engagement form for the query pattern and its trade-offs.
  const validities = createQuery<{
    from: string | undefined | null
    to: string | undefined | null
  }>({ from: null, to: null })
  $: if (selectedEngagement) {
    const engagementUuid = selectedEngagement.uuid
    validities.run((signal) => getEngagementValidities(engagementUuid, signal))
  } else {
    validities.run(async () => ({ from: null, to: null }))
  }

  const facets = createQuery<FacetValidities[]>()
  const engagements = createQuery<EngagementTitleAndUuid[]>()
  // Only fetch when a start date is set: getClasses rejects a null date, and
  // both selects are disabled without one anyway.
  $: if (startDate) {
    facets.run((signal) =>
      getClasses(
        { currentDate: startDate, orgUuid: null, facetUserKeys: ["leave_type"] },
        signal
      )
    )
    engagements.run(async (signal) => {
      const res = await graphQLClient(signal).request(GetEngagementsDocument, {
        uuid: $page.params.uuid,
        fromDate: startDate,
        toDate: toDate || null,
      })
      return res.engagements?.objects.map((e) => e.validities[0]) ?? []
    })
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("leave", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("leave", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( GetEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}}
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
      </div>
    </div>
  </div>
{:then data}
  {@const person = data.employees?.objects[0].validities}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={$validities.data?.from}
            max={toDate ? toDate : $validities.data?.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : $validities.data?.from}
            max={$validities.data?.to}
          />
        </div>
        <Search
          type="employee"
          bind:value={selectedPerson}
          startValue={{
            uuid: findClosestValidity(person, startDate).uuid,
            name: findClosestValidity(person, startDate).name,
          }}
          disabled
          required={true}
        />
        {#if $facets.loading && !$facets.data}
          <Skeleton />
        {/if}
        {#if $facets.error}
          <p class="text-sm text-error">
            {capital($_($facets.data ? "load_error_options" : "load_error"))}
          </p>
        {/if}
        {#if $facets.data}
          <Select
            title={capital($_("leave_type"))}
            id="leave-type-uuid"
            bind:name={$leaveType.value}
            errors={$leaveType.errors}
            iterable={filterClassesByFacetUserKey($facets.data, "leave_type")}
            disabled={!startDate || $facets.error}
            required={true}
          />
        {/if}

        {#if $engagements.error}
          <p class="text-sm text-error">
            {capital($_($engagements.data ? "load_error_options" : "load_error"))}
          </p>
        {/if}
        {#if $engagements.data?.length}
          <Select
            title={capital($_("engagement", { values: { n: 2 } }))}
            id="engagement-uuid"
            bind:name={$engagement.value}
            bind:value={selectedEngagement}
            errors={$engagement.errors}
            on:clear={() => ($engagement.value = "")}
            iterable={formatEngagementTitlesAndUuid($engagements.data)}
            disabled={!startDate || $engagements.error}
            isClearable={true}
            required={true}
          />
        {:else}
          <Select
            title={capital($_("engagement", { values: { n: 2 } }))}
            id="engagement-uuid"
            bind:value={selectedEngagement}
            bind:name={$engagement.value}
            errors={$engagement.errors}
            disabled
            required={true}
          />
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("create_item", {
            values: { item: $_("leave", { values: { n: 1 } }) },
          })
        )}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      />
    </div>
    <Error />
  </form>
{/await}
