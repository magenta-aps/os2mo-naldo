<script lang="ts">
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { CreateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { form, field } from "svelte-forms"
  import { required, pattern } from "svelte-forms/validators"

  const cprNumber = field("cpr_number", "", [required(), pattern(/^\d{6}-?\d{4}$/)])
  const firstName = field("first_name", "", [required()])
  const lastName = field("last_name", "", [required()])
  const svelteForm = form(cprNumber, firstName, lastName)
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
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateEmployeeDocument, {
              input: result.data,
            })
            $success = {
              message: `Medarbejderen ${
                mutation.employee_create.objects.length
                  ? mutation.employee_create.objects[0].name
                  : ""
              } er blevet oprettet.`,
              uuid: mutation.employee_create.objects.length
                ? mutation.employee_create.objects[0].uuid
                : null,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
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
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <Input
        title="CPR nummer"
        id="cpr-number"
        bind:value={$cprNumber.value}
        errors={$cprNumber.errors}
        required={true}
      />
      <div class="flex flex-row gap-6">
        <Input
          title="Fornavn"
          id="first-name"
          bind:value={$firstName.value}
          errors={$firstName.errors}
          required={true}
          extra_classes="basis-1/2"
        />
        <Input
          title="Efternavn(e)"
          id="last-name"
          bind:value={$lastName.value}
          errors={$lastName.errors}
          required={true}
          extra_classes="basis-1/2"
        />
      </div>
      <div class="flex flex-row gap-6">
        <Input
          title="Kaldenavn fornavn"
          id="nickname-first-name"
          bind:value={nicknameFirstName}
          extra_classes="basis-1/2"
        />
        <Input
          title="Kaldenavn efternavn(e)"
          id="nickname-last-name"
          bind:value={nicknameLastName}
          extra_classes="basis-1/2"
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
