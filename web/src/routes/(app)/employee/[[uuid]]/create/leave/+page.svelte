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
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              user_key
            }
            uuid
            job_function {
              user_key
              name
            }
          }
        }
      }
    }

    mutation CreateLeave($input: LeaveCreateInput!, $date: DateTime!) {
      leave_create(input: $input) {
        current(at: $date) {
          person {
            name
            uuid
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
                    name: mutation.leave_create.current?.person?.[0].name,
                  },
                })
              ),
              uuid: mutation.leave_create.current?.person?.[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const updateEngagements = async (
    employeeUuid: string | undefined | null,
    fromDate: string,
    toDate: string
  ) => {
    const res = await graphQLClient().request(GetEngagementsDocument, {
      uuid: employeeUuid,
      fromDate: fromDate,
      toDate: toDate,
    })
    return (engagements = res.engagements?.objects.map((e) => e.validities[0]))
  }

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  // This needs to be done by itself, otherwise we end in an infinite loop
  $: if (selectedEngagement) {
    ;(async () => {
      validities = await getEngagementValidities(selectedEngagement.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  let facets: FacetValidities[]
  let engagements: EngagementTitleAndUuid[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const params = {
      currentDate: startDate,
      orgUuid: null,
      facetUserKeys: ["leave_type"],
    }

    ;(async () => {
      try {
        facets = await getClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
      await updateEngagements($page.params.uuid, startDate, toDate)
    })()
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
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
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
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
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
        {#if facets}
          <Select
            title={capital($_("leave_type"))}
            id="leave-type-uuid"
            bind:name={$leaveType.value}
            errors={$leaveType.errors}
            iterable={filterClassesByFacetUserKey(facets, "leave_type")}
            required={true}
          />
        {/if}

        {#if engagements && engagements.length}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
            id="engagement-uuid"
            bind:name={$engagement.value}
            bind:value={selectedEngagement}
            errors={$engagement.errors}
            on:clear={() => ($engagement.value = "")}
            iterable={formatEngagementTitlesAndUuid(engagements)}
            isClearable={true}
            required={true}
          />
        {:else}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
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
