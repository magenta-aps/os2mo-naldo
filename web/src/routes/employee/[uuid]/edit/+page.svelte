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

  let fromDate: string
  let toDate: string
  let firstName: string
  let lastName: string
  let nicknameFirstName: string
  let nicknameLastName: string
  let seniority: string

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
            seniority
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
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateEmployeeDocument, {
            input: result.data,
          })
          $success = {
            message: `Medarbejderen ${mutation.employee_update.objects[0].name} er blevet redigeret.`,
            uuid: mutation.employee_update.objects[0].uuid,
            type: "employee",
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
  {@const employee = data.employees.objects[0].objects[0]}

  <title>Redigér Medarbejder | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Redigér medarbejder</h3>
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
            title="Navn"
            id="first-name"
            bind:value={firstName}
            startValue={employee.given_name}
            extra_classes="basis-1/2"
          />
          <Input
            id="last-name"
            bind:value={lastName}
            startValue={employee.surname}
            extra_classes="basis-1/2 pt-6"
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title="Kaldenavn"
            id="nickname-first-name"
            bind:value={nicknameFirstName}
            startValue={employee.nickname_givenname}
            extra_classes="basis-1/2"
          />
          <Input
            id="nickname-last-name"
            bind:value={nicknameLastName}
            startValue={employee.nickname_surname}
            extra_classes="basis-1/2 pt-6"
          />
        </div>
        <DateInput
          bind:value={seniority}
          title="Anciennitet"
          id="seniority"
          startValue={employee.seniority}
        />
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
