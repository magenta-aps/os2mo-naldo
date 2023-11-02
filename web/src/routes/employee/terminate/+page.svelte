<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument, TerminateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"
  import { getUuidFromHash } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  const toDate = field("to", "", [required()])
  const employeeField = field("employee", "", [required()])

  const svelteForm = form(toDate, employeeField)
  const urlHashEmployeeUuid = getUuidFromHash($page.url.hash)

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime!, $includeEmployee: Boolean!) {
      ...getEmployeeData
    }

    fragment getEmployeeData on Query {
      employees(filter: { uuids: $uuid, from_date: $fromDate })
        @include(if: $includeEmployee) {
        objects {
          objects {
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
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(TerminateEmployeeDocument, {
              input: result.data,
            })

            $success = {
              message: `${
                mutation.employee_terminate.objects[0].name
                  ? mutation.employee_terminate.objects[0].name
                  : "Medarbejderen"
              } opsiges d. ${$toDate.value}`,
              uuid: mutation.employee_terminate.objects[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title>Opsig medarbejder | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opsig medarbejder</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request( EmployeeDocument, { uuid: urlHashEmployeeUuid, fromDate: $date, includeEmployee: urlHashEmployeeUuid ? true : false } )}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
  {:then data}
    {@const employee = data.employees?.objects[0].objects[0]}
    {@const minDate = employee?.validity.from.split("T")[0]}
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$toDate.value}
            errors={$toDate.errors}
            title="Slutdato"
            id="to"
            min={minDate}
            required={true}
          />
        </div>
        {#if employee}
          <Search
            type="employee"
            title="Medarbejder"
            startValue={{
              uuid: employee.uuid,
              name: employee.name,
              attrs: [],
            }}
            bind:name={$employeeField.value}
            on:clear={() => ($employeeField.value = "")}
            errors={$employeeField.errors}
            required={true}
          />
        {:else}
          <Search
            type="employee"
            title="Medarbejder"
            bind:name={$employeeField.value}
            on:clear={() => ($employeeField.value = "")}
            errors={$employeeField.errors}
            required={true}
          />
        {/if}
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opsig medarbejder</button
      >
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
