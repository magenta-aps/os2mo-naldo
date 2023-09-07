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
  import { CreateLeaveDocument, LeaveAndEmployeeDocument } from "./query.generated"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { getEngagementTitlesAndUuid } from "$lib/util/helpers"

  let fromDate: string
  let toDate: string
  let leaveType: string
  let engagementUuid: string

  gql`
    query LeaveAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["leave_type"]) {
        uuid
        user_key
        classes {
          uuid
          user_key
          name
        }
      }
      employees(uuids: $uuid, from_date: $fromDate) {
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
    mutation CreateLeave($input: LeaveCreateInput!) {
      leave_create(input: $input) {
        objects {
          employee {
            name
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
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( LeaveAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const minDate = data.employees[0].objects[0].validity.from.split("T")[0]}
  {@const maxDate = data.employees[0].objects[0].validity?.to?.split("T")[0]}
  {@const engagements = data.employees[0].objects[0].engagements}
  {@const employeeName = data.employees[0].objects[0].name}

  <title>Opret orlov | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret orlov</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>

        <Select
          bind:value={leaveType}
          title="Orlovstype"
          id="leave-type-uuid"
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
        <Input
          title="Medarbejder"
          id="employee-uuid"
          startValue={employeeName}
          value={undefined}
          disabled
        />
        <Select
          bind:value={engagementUuid}
          title="Engagementer"
          id="engagement-uuid"
          iterable={getEngagementTitlesAndUuid(engagements)}
          required={true}
        />
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
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
