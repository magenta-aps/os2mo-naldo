<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { LeaveDocument, TerminateLeaveDocument } from "./query.generated"

  let toDate: string

  gql`
    query Leave($uuid: [UUID!], $fromDate: DateTime) {
      leaves(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            engagement {
              uuid
              validity {
                from
                to
              }
              person {
                uuid
                name
              }
            }
          }
        }
      }
    }
    mutation TerminateLeave($input: LeaveTerminateInput!) {
      leave_terminate(input: $input) {
        objects {
          person {
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
          const mutation = await graphQLClient().request(TerminateLeaveDocument, {
            input: result.data,
          })
          $success = {
            message: `Afsluttede orlov for ${mutation.leave_terminate.objects[0].person[0].name} `,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }
</script>

{#await graphQLClient().request( LeaveDocument, { uuid: $page.params.leave, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const leave = data.leaves.objects[0].objects[0]}
  {@const minDate = leave.engagement.validity.from.split("T")[0]}
  {@const maxDate = leave.engagement.validity?.to?.split("T")[0]}
  {@const employeeName = leave.engagement.person[0].name}

  <title>Afslut orlov for {employeeName} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Afslut orlov for {employeeName}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={$date}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Afslut orlov
      </button>
      <a
        href={`${base}/employee/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
    </div>
    <Error />
  </form>
{/await}
