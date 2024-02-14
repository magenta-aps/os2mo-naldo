<script lang="ts">
  import { _ } from "svelte-i18n"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { GetSpConfigDocument, CreateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { form, field } from "svelte-forms"
  import { required, pattern } from "svelte-forms/validators"
  import CprLookup from "$lib/components/CPRLookup.svelte"

  let person: CprLookupResponse
  let nicknameFirstName: string
  let nicknameLastName: string

  let seperatedFirstName: string | null | undefined
  let seperatedLastName: string | null | undefined
  $: {
    seperatedFirstName = person?.name?.split(" ").slice(0, -1).join(" ")
    seperatedLastName = person?.name?.split(" ").slice(-1).join(" ")
  }

  const cprNumber = field("cpr_number", "", [required(), pattern(/^\d{6}\d{4}$/)])
  const firstName = field("first_name", "", [required()])
  const lastName = field("last_name", "", [required()])
  const svelteForm = form(cprNumber, firstName, lastName)

  gql`
    query GetSPConfig {
      configuration(filter: { identifiers: "enable_sp" }) {
        objects {
          jsonified_value
          key
        }
      }
    }

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

<title>{$_("create")} {$_("employee")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("create")} {$_("employee")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  {#await graphQLClient().request(GetSpConfigDocument)}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
  {:then data}
    {@const SpEnabled = data.configuration.objects[0].jsonified_value === "true"}

    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        {#if SpEnabled}
          <CprLookup
            title={$_("cpr_number")}
            id="cpr-number"
            bind:value={person}
            bind:cprNumber={$cprNumber.value}
            errors={$cprNumber.errors}
          />
          <div class="flex flex-row gap-6">
            <Input
              title={$_("givenname(s)")}
              id="first-name"
              bind:value={seperatedFirstName}
              bind:cprName={$firstName.value}
              errors={$firstName.errors}
              extra_classes="basis-1/2"
              required={true}
              readonly
            />
            <Input
              title={$_("surname")}
              id="last-name"
              bind:value={seperatedLastName}
              bind:cprName={$lastName.value}
              errors={$lastName.errors}
              extra_classes="basis-1/2"
              required={true}
              readonly
            />
          </div>
        {:else}
          <Input
            title={$_("cpr_number")}
            id="cpr-number"
            bind:value={$cprNumber.value}
            errors={$cprNumber.errors}
            required={true}
          />
          <div class="flex flex-row gap-6">
            <Input
              title={$_("givenname(s)")}
              id="first-name"
              bind:cprName={$firstName.value}
              errors={$firstName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
            <Input
              title={$_("surname")}
              id="last-name"
              bind:cprName={$lastName.value}
              errors={$lastName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
        {/if}
        <div class="flex flex-row gap-6">
          <Input
            title={$_("nickname_givenname(s)")}
            id="nickname-first-name"
            bind:value={nicknameFirstName}
            extra_classes="basis-1/2"
          />
          <Input
            title={$_("nickname_surname")}
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
        >{$_("create")} {$_("employee")}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => history.back()}
      >
        {$_("cancel")}
      </button>
    </div>
    <Error />
  {/await}
</form>
