<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import {
    CreateLeaveDocument,
    LeaveTypeDocument,
    GetEmployeeDocument,
  } from "./query.generated"
  import {
    getEngagementTitlesAndUuid,
    getEngagementValidities,
    type EngagementTitleAndUuid,
  } from "$lib/util/helpers"
  import Search from "$lib/components/search/Search.svelte"
  import { onMount } from "svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const employeeField = field("employee", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, employeeField, leaveType, engagement)

  let employee: {
    uuid: string
    name: string
  }
  let engagements: EngagementTitleAndUuid[] | undefined
  let selectedEngagement: {
    uuid: string
    name: string
  }
  gql`
    query LeaveType($currentDate: DateTime) {
      facets(filter: { user_keys: ["leave_type"] }) {
        objects {
          validities {
            uuid
            user_key
            classes(filter: { from_date: $currentDate }) {
              uuid
              user_key
              name
            }
          }
        }
      }
    }

    query GetEmployee($uuid: [UUID!], $currentDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          current(at: $currentDate) {
            uuid
            name
            engagements(filter: { from_date: $currentDate }) {
              org_unit(filter: { from_date: $currentDate }) {
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

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (selectedEngagement) {
    ;(async () => {
      validities = await getEngagementValidities(selectedEngagement.uuid)
    })()
  } else {
    validities = { from: null, to: null }
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

  const updateEngagements = async (employeeUuid: string | undefined | null) => {
    const res = await graphQLClient().request(GetEmployeeDocument, {
      uuid: employeeUuid,
      // Maybe this should be `fromdate`?
      currentDate: $date,
    })
    engagements = res.employees?.objects[0].current?.engagements
  }

  onMount(async () => {
    await updateEngagements($page.params.uuid)
  })
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

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          startValue={$date}
          bind:value={$fromDate.value}
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
      {#await graphQLClient().request(LeaveTypeDocument, { currentDate: $date })}
        <Select
          title={capital($_("leave_type"))}
          id="leave-type-uuid"
          required={true}
        />
      {:then data}
        {@const facets = data.facets.objects}
        <Select
          title={capital($_("leave_type"))}
          id="leave-type-uuid"
          bind:name={$leaveType.value}
          errors={$leaveType.errors}
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
      {/await}

      {#if $page.params.uuid}
        {#await graphQLClient().request( GetEmployeeDocument, { uuid: $page.params.uuid, currentDate: $date } )}
          <Input
            title="{capital($_('specify'))} {$_('employee', { values: { n: 1 } })}"
            id="employee-uuid"
            disabled
            placeholder="{capital($_('loading'))} {$_('employee', {
              values: { n: 1 },
            })}..."
            required={true}
          />
        {:then employeeData}
          {@const startValueEmployee = employeeData.employees?.objects[0].current}
          <Search
            type="employee"
            startValue={startValueEmployee
              ? {
                  uuid: startValueEmployee.uuid,
                  name: startValueEmployee.name,
                }
              : undefined}
            bind:value={employee}
            bind:name={$employeeField.value}
            errors={$employeeField.errors}
            on:change={() => updateEngagements(employee.uuid)}
            on:clear={() => {
              $employeeField.value = ""
              $engagement.value = ""
              engagements = undefined
            }}
            required={true}
          />
        {/await}
      {:else}
        <Search
          type="employee"
          bind:value={employee}
          bind:name={$employeeField.value}
          errors={$employeeField.errors}
          on:change={() => updateEngagements(employee.uuid)}
          on:clear={() => {
            $employeeField.value = ""
            $engagement.value = ""
            engagements = undefined
          }}
          required={true}
        />
      {/if}

      {#if engagements && engagements.length}
        {#key engagements}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
            id="engagement-uuid"
            bind:name={$engagement.value}
            bind:value={selectedEngagement}
            errors={$engagement.errors}
            iterable={getEngagementTitlesAndUuid(engagements)}
            required={true}
          />
        {/key}
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
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >{capital(
        $_("create_item", {
          values: { item: $_("leave", { values: { n: 1 } }) },
        })
      )}
    </button>
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      on:click={() => history.back()}
    >
      {capital($_("cancel"))}
    </button>
  </div>
  <Error />
</form>
