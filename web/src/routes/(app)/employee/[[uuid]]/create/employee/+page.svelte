<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import Error from "$lib/components/alerts/Error.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { CreateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import EmployeeFields from "$lib/components/forms/entity/EmployeeFields.svelte"
  import {
    createDefaultEmployeeValues,
    type EmployeeValues,
  } from "$lib/components/forms/entity/types"

  let values: EmployeeValues = createDefaultEmployeeValues()
  let fields: EmployeeFields

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
      if (!(await fields.validate())) return
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
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
    <div class="p-8">
      <EmployeeFields bind:value={values} bind:this={fields} />
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
