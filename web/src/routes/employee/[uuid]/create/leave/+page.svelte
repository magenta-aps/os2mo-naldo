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
  import { getEngagementTitlesAndUuid } from "$lib/util/helpers"
  import Search from "$lib/components/search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const leaveType = field("leave_type", "", [required()])
  const engagement = field("engagement", "", [required()])
  const svelteForm = form(fromDate, leaveType, engagement)

  gql`
    query LeaveAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
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
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
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
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateLeaveDocument, {
              input: result.data,
            })
            $success = {
              message: `${
                mutation.leave_create.objects[0]?.leave_type
                  ? mutation.leave_create.objects[0]?.leave_type.name
                  : "Orloven"
              } ${
                mutation.leave_create.objects[0]?.employee
                  ? `for ${mutation.leave_create.objects[0].employee[0].name}`
                  : ""
              } er oprettet fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( LeaveAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets.objects}
  {@const employee = data.employees.objects[0].objects[0]}
  {@const minDate = employee.validity.from.split("T")[0]}
  {@const maxDate = employee.validity?.to?.split("T")[0]}
  {@const engagements = employee.engagements}

  <title>Opret orlov | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret orlov</h3>
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
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>

        <Select
          title="Orlovstype"
          id="leave-type-uuid"
          bind:name={$leaveType.value}
          errors={$leaveType.errors}
          iterable={getClassesByFacetUserKey(facets, "leave_type")}
          required={true}
        />
        <Search
          type="employee"
          startValue={{
            uuid: employee.uuid,
            name: employee.name,
          }}
          disabled
          required={true}
        />
        <Select
          title="Engagementer"
          id="engagement-uuid"
          bind:name={$engagement.value}
          errors={$engagement.errors}
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
