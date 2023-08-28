<script lang="ts">
    import DateInput from "$lib/components/forms/shared/date_input.svelte"
    import Error from "$lib/components/alerts/error.svelte"
    import { enhance } from "$app/forms"
    import type { SubmitFunction } from "./$types"
    import { goto } from "$app/navigation"
    import { base } from "$app/paths"
    import { success, error } from "$lib/stores/alert"
    import { graphQLClient } from "$lib/util/http"
    import { EmployeeDocument, TerminateEmployeeDocument } from "./query.generated"
    import { gql } from "graphql-request"
    import { page } from "$app/stores"
    import { date } from "$lib/stores/date"
    import {activeEmployeeTab} from "$lib/stores/tab";
  
    let toDate: string
  
    gql`
      query Employee($uuid: [UUID!], $fromDate: DateTime!) {
        employees(uuids: $uuid, from_date: $fromDate) {
          objects {
            uuid
            name
            validity {
              from
              to
            }
            engagements {
              org_unit {
                validity {
                  from
                  to
                }
              }
            }
          }
        }
      }
  
      mutation TerminateEmployee($input: EmployeeTerminateInput!) {
        employee_terminate(input: $input) {
          objects {
            uuid
            name
          }
        }
      }
    `
    const handler: SubmitFunction =
      () =>
      async ({ result }) => {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(TerminateEmployeeDocument, {
              input: result.data,
            })
  
            $success = {
              message: `${mutation.employee_terminate.objects[0].name} afsluttes d. ${toDate}`,
              uuid: $page.params.uuid,
              type: "employee",
              tab: $activeEmployeeTab,
            }
          } catch (err) {
            console.error(err)
            $error = { message: err as string }
          }
        }
      }
  </script>
  
  {#await graphQLClient().request( EmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const employee = data.employees[0].objects[0]}
  {@const minDate = employee.validity.from.split("T")[0]}
  {@const maxDate = employee.engagements[0]?.org_unit[0].validity.to?.split("T")[0]}
  <title>Opsig {employee.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opsig {employee.name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={$date}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opsig medarbejder</button
      >
      <a
        href={`${base}/employee/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
    </div>
    <Error />
  </form>
{/await}
