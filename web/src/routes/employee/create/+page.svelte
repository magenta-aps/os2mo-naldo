<script lang="ts">
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { CreateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"

  let cprNumber: string
  let firstName: string
  let lastName: string
  let nicknameFirstName: string
  let nicknameLastName: string

  gql`
    mutation CreateEmployee($input: EmployeeCreateInput!) {
      employee_create(input: $input) {
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
          const mutation = await graphQLClient().request(CreateEmployeeDocument, {
            input: result.data,
          })
          $success = {
            message: `Medarbejderen ${mutation.employee_create.objects[0].name} er blevet oprettet.`,
            uuid: mutation.employee_create.objects[0].uuid,
            type: "employee",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

<title>Opret Medarbejder | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret ny medarbejder</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />
<form method="post" class="mx-6" use:enhance={handler}>
  <div class="w-1/2 min-w-fit bg-slate-100 rounded">
    <div class="p-8">
      <Input title="CPR nummer" id="cpr-number" bind:value={cprNumber} />
      <div class="flex flex-row gap-6">
        <Input
          title="Navn"
          placeholder="Fornavn"
          id="first-name"
          bind:value={firstName}
          required={true}
          extra_classes="basis-1/2"
        />
        <Input
          id="last-name"
          placeholder="Efternavn"
          bind:value={lastName}
          required={true}
          extra_classes="pt-6 basis-1/2"
        />
      </div>
      <div class="flex flex-row gap-6">
        <Input
          title="Kaldenavn"
          id="nickname-first-name"
          placeholder="Fornavn"
          bind:value={nicknameFirstName}
          extra_classes="basis-1/2"
        />
        <Input
          id="nickname-last-name"
          placeholder="Efternavn"
          bind:value={nicknameLastName}
          extra_classes="pt-6 basis-1/2"
        />
      </div>
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Opret medarbejder</button
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
</form>
