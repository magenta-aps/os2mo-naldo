<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { CreateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { form, field } from "svelte-forms"
  import { required, pattern } from "svelte-forms/validators"
  import CprLookup from "$lib/components/forms/shared/CPRLookup.svelte"

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
    mutation CreateEmployee($input: EmployeeCreateInput!) {
      employee_create(input: $input) {
        current {
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
              message: capital(
                $_("success_create", {
                  values: {
                    name: mutation.employee_create.current?.name,
                  },
                })
              ),
              uuid: mutation.employee_create.current?.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("employee", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("employee", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      {#if env.PUBLIC_ENABLE_SP}
        <CprLookup
          title={capital($_("cpr_number"))}
          id="cpr-number"
          bind:value={person}
          bind:cprNumber={$cprNumber.value}
          errors={$cprNumber.errors}
        />
        <!-- If we get a response with empty name property, it means that a fictional CPR-number has been entered. -->
        <!-- Therefore we allow typing a name, rather than making the input read-only. -->
        {#if person && person.name === ""}
          <div class="flex flex-row gap-6">
            <Input
              title={capital($_("givenname", { values: { n: 2 } }))}
              id="first-name"
              bind:cprName={$firstName.value}
              errors={$firstName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
            <Input
              title={capital($_("surname"))}
              id="last-name"
              bind:cprName={$lastName.value}
              errors={$lastName.errors}
              extra_classes="basis-1/2"
              required={true}
            />
          </div>
        {:else}
          <div class="flex flex-row gap-6">
            <Input
              title={capital($_("givenname", { values: { n: 2 } }))}
              id="first-name"
              bind:value={seperatedFirstName}
              bind:cprName={$firstName.value}
              errors={$firstName.errors}
              extra_classes="basis-1/2"
              required={true}
              readonly
            />
            <Input
              title={capital($_("surname"))}
              id="last-name"
              bind:value={seperatedLastName}
              bind:cprName={$lastName.value}
              errors={$lastName.errors}
              extra_classes="basis-1/2"
              required={true}
              readonly
            />
          </div>
        {/if}
      {:else}
        <Input
          title={capital($_("cpr_number"))}
          id="cpr-number"
          bind:value={$cprNumber.value}
          errors={$cprNumber.errors}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("givenname", { values: { n: 2 } }))}
            id="first-name"
            bind:cprName={$firstName.value}
            errors={$firstName.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital($_("surname"))}
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
          title={capital($_("nickname_givenname", { values: { n: 2 } }))}
          id="nickname-first-name"
          bind:value={nicknameFirstName}
          extra_classes="basis-1/2"
        />
        <Input
          title={capital($_("nickname_surname"))}
          id="nickname-last-name"
          bind:value={nicknameLastName}
          extra_classes="basis-1/2"
        />
      </div>
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("employee", { values: { n: 1 } }) },
        })
      )}
    />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      on:click={() => history.back()}
    />
  </div>
  <Error />
</form>
