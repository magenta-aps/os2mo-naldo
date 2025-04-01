<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument, TerminateEmployeeDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getValidities } from "$lib/util/helpers"

  let selectedPerson: {
    uuid: string
    name: string
  }

  const toDate = field("to", "", [required()])
  const employeeField = field("employee", "", [required()])

  const svelteForm = form(toDate, employeeField)

  gql`
    query Employee($uuid: [UUID!], $currentDate: DateTime!) {
      employees(filter: { uuids: $uuid }) {
        objects {
          current(at: $currentDate) {
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
        current {
          uuid
          name
        }
      }
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (selectedPerson) {
    ;(async () => {
      validities = await getValidities(selectedPerson.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }
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
              message: capital(
                $_("success_terminate_employee", {
                  values: {
                    name: mutation.employee_terminate.current?.name,
                  },
                })
              ),
              uuid: mutation.employee_terminate.current?.uuid,
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
    $_("terminate_item", {
      values: { item: $_("employee", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("employee", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          title={capital($_("date.end_date"))}
          id="to"
          min={validities.from}
          max={undefined}
          required={true}
        />
      </div>
      {#if $page.params.uuid}
        {#await graphQLClient().request( EmployeeDocument, { uuid: $page.params.uuid, currentDate: $date } )}
          <Input
            title="{capital($_('specify'))} {$_('employee', { values: { n: 1 } })}"
            id="organisation-uuid"
            disabled
            placeholder="{capital($_('loading'))} {$_('employee', {
              values: { n: 1 },
            })}..."
            required={true}
          />
        {:then data}
          {@const employee = data.employees?.objects[0].current}

          <Search
            type="employee"
            title={capital($_("employee", { values: { n: 1 } }))}
            startValue={{
              uuid: employee?.uuid ? employee.uuid : undefined,
              name: employee?.name ? employee.name : "",
            }}
            bind:value={selectedPerson}
            bind:name={$employeeField.value}
            on:clear={() => ($employeeField.value = "")}
            errors={$employeeField.errors}
            required={true}
          />
        {/await}
      {:else}
        <Search
          type="employee"
          title={capital($_("employee", { values: { n: 1 } }))}
          bind:value={selectedPerson}
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
      >{capital(
        $_("terminate_item", {
          values: { item: $_("employee", { values: { n: 1 } }) },
        })
      )}</button
    >
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      on:click={() => history.back()}
    >
      {capital($_("cancel"))}
    </button>
  </div>
  <Error />
</form>
