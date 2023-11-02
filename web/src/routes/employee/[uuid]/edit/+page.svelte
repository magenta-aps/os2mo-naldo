<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { date } from "$lib/stores/date"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { UpdateEmployeeDocument, EmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const firstName = field("first_name", "", [required()])
  const lastName = field("last_name", "", [required()])
  const svelteForm = form(fromDate, firstName, lastName)

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            given_name
            surname
            nickname_givenname
            nickname_surname
            cpr_no
            validity {
              from
              to
            }
          }
        }
      }
    }
    mutation UpdateEmployee($input: EmployeeUpdateInput!) {
      employee_update(input: $input) {
        objects {
          name
          uuid
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
            const mutation = await graphQLClient().request(UpdateEmployeeDocument, {
              input: result.data,
            })
            $success = {
              message: `Medarbejderen ${mutation.employee_update.objects[0].name} redigeres fra d. ${$fromDate.value}`,
              uuid: mutation.employee_update.objects[0].uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( EmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const employee = data.employees.objects[0].objects[0]}

  <title>Redigér Medarbejder | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Redigér medarbejder</h3>
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
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={employee.validity.to
              ? employee.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title="Fornavn"
            id="first-name"
            startValue={employee.given_name}
            bind:value={$firstName.value}
            errors={$firstName.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title="Efternavn(e)"
            id="last-name"
            startValue={employee.surname}
            bind:value={$lastName.value}
            errors={$lastName.errors}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title="Kaldenavn fornavn"
            id="nickname-first-name"
            startValue={employee.nickname_givenname}
            extra_classes="basis-1/2"
          />
          <Input
            title="Kaldenavn efternavn(e)"
            id="nickname-last-name"
            startValue={employee.nickname_surname}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Redigér medarbejder</button
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
