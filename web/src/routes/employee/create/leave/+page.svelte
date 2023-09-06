<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import {
    CreateLeaveDocument,
    LeaveTypeAndEmployeeDocument,
    GetEmployeeDocument,
  } from "./query.generated"
  import {
    getEngagementTitlesAndUuid,
    type EngagementTitleAndUuid,
    getUuidFromHash,
  } from "$lib/util/helpers"
  import Search from "$lib/components/search.svelte"
  import { onMount } from "svelte"

  let employee: {
    uuid: string
    name: string
    attrs: []
  }
  let engagements: EngagementTitleAndUuid[] | undefined
  let fromDate: string
  let toDate: string

  gql`
    query LeaveTypeAndEmployee(
      $uuid: [UUID!]
      $fromDate: DateTime
      $includeEmployee: Boolean!
    ) {
      facets(filter: { user_keys: ["leave_type"] }) {
        objects {
          objects {
            uuid
            user_key
            classes {
              uuid
              user_key
              name
            }
          }
        }
      }
      employees(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeEmployee) {
        objects {
          objects {
            uuid
            name
          }
        }
      }
    }

    query GetEmployee($uuid: [UUID!], $fromDate: DateTime, $includeEmployee: Boolean!) {
      employees(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeEmployee) {
        objects {
          objects {
            uuid
            name
            engagements {
              org_unit {
                name
                user_key
              }
              uuid
              job_function {
                user_key
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation CreateLeave($input: LeaveCreateInput!) {
      leave_create(input: $input) {
        objects {
          employee {
            name
            uuid
          }
          leave_type {
            name
          }
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(CreateLeaveDocument, {
            input: result.data,
          })
          $success = {
            message: `${mutation.leave_create.objects[0].leave_type.name} til ${mutation.leave_create.objects[0].employee[0].name} er blevet oprettet`,
            uuid: mutation.leave_create.objects[0].employee[0].uuid,
            type: "employee",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }

  const urlHashEmployeeUuid = getUuidFromHash($page.url.hash)
  const includeEmployee = urlHashEmployeeUuid ? true : false

  async function updateEngagements(employeeUuid: string | undefined | null) {
    const res = await graphQLClient().request(GetEmployeeDocument, {
      uuid: employeeUuid,
      fromDate: $date,
      includeEmployee: employeeUuid ? true : false,
    })
    engagements = res.employees?.objects[0].objects[0].engagements
  }

  onMount(async () => {
    await updateEngagements(urlHashEmployeeUuid)
  })
</script>

<title>Opret orlov | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret orlov</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( LeaveTypeAndEmployeeDocument, { uuid: urlHashEmployeeUuid, fromDate: $date, includeEmployee: includeEmployee } )}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
  {:then data}
    {@const facets = data.facets.objects}
    {@const startValueEmployee = data.employees?.objects[0].objects[0]}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
          />
          <DateInput bind:value={toDate} title="Slutdato" id="to" />
        </div>

        <Select
          title="Orlovstype"
          id="leave-type-uuid"
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
        <Search
          title="Medarbejder"
          type="employee"
          startValue={startValueEmployee
            ? {
                uuid: startValueEmployee.uuid,
                name: startValueEmployee.name,
                attrs: [],
              }
            : undefined}
          bind:value={employee}
          on:change={() => updateEngagements(employee.uuid)}
          on:clear={() => (engagements = undefined)}
        />
        {#if engagements && engagements.length}
          {#key engagements}
            <Select
              title="Engagementer"
              id="engagement-uuid"
              startValue={getEngagementTitlesAndUuid(engagements)[0].name}
              iterable={getEngagementTitlesAndUuid(engagements)}
              required={true}
            />
          {/key}
        {:else}
          <Select title="Engagementer" id="engagement-uuid" disabled />
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret orlov
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => history.back()}
      >
        Annullér
      </button>
    </div>
    <Error />
  {/await}
</form>
