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
  import Input from "$lib/components/forms/shared/input.svelte"
  import { LeaveAndFacetDocument, UpdateLeaveDocument } from "./query.generated"
  import { getEngagementTitlesAndUuid } from "$lib/util/helpers"

  let fromDate: string
  let toDate: string
  let leaveType: string
  let engagementUuid: string

  gql`
    query LeaveAndFacet($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["leave_type"]) {
        uuid
        user_key
        classes {
          uuid
          user_key
          name
        }
      }
      leaves(uuids: $uuid, from_date: $fromDate) {
        objects {
          engagement {
            uuid
            org_unit {
              name
            }
            job_function {
              name
            }
          }
          leave_type {
            user_key
            uuid
          }
          validity {
            from
            to
          }
          employee {
            uuid
            name
            engagements {
              uuid
              org_unit {
                uuid
                name
              }
              job_function {
                uuid
                name
              }
            }
          }
        }
      }
    }

    mutation UpdateLeave($input: LeaveUpdateInput!) {
      leave_update(input: $input) {
        objects {
          person {
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
          const mutation = await graphQLClient().request(UpdateLeaveDocument, {
            input: result.data,
          })
          $success = {
            message: `Orlov for ${mutation.leave_update.objects[0].person.name} er blevet redigeret`,
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

{#await graphQLClient().request( LeaveAndFacetDocument, { uuid: $page.params.leave, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const leave = data.leaves[0].objects[0]}
  {@const facets = data.facets}
  {@const minDate = leave.validity.from.split("T")[0]}
  {@const maxDate = leave.validity?.to?.split("T")[0]}
  {@const engagements = leave.employee.engagements}
  {@const employeeName = leave.employee.name}
  {@const engagementStartValue = getEngagementTitlesAndUuid([leave.engagement])}

  <title>Rediger orlov | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger orlov</h3>
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
            startValue={leave.validity.to ? leave.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
            max={maxDate}
          />
        </div>

        <Select
          bind:value={leaveType}
          startValue={leave.leave_type.user_key}
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
          startValue={engagementStartValue.name}
          iterable={getEngagementTitlesAndUuid(engagements)}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger orlov</button
      >
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
