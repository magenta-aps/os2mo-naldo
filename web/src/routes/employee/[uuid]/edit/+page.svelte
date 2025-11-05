<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { date } from "$lib/stores/date"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { UpdateEmployeeDocument, EmployeeDocument } from "./query.generated"
  import { getPersonValidities } from "$lib/http/getValidities"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            given_name
            surname
            nickname_givenname
            nickname_surname
            cpr_number
            validity {
              from
              to
            }
          }
        }
      }
    }
    mutation UpdateEmployee($input: EmployeeUpdateInput!, $date: DateTime!) {
      employee_update(input: $input) {
        current(at: $date) {
          name
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string

  const fromDate = field("from", "", [required()])
  const firstName = field("first_name", "", [required()])
  const lastName = field("last_name", "", [required()])
  const svelteForm = form(fromDate, firstName, lastName)

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
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("employee", { values: { n: 0 } }),
                    name: mutation.employee_update.current?.name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: {
    ;(async () => {
      validities = $page.params.uuid
        ? await getPersonValidities($page.params.uuid)
        : { from: null, to: null }
    })()
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("employee", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("employee", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( EmployeeDocument, { uuid: $page.params.uuid, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to") } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const employee = data.employees.objects[0].validities[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={employee?.validity.to
              ? employee?.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("givenname", { values: { n: 2 } }))}
            id="first-name"
            startValue={employee?.given_name}
            bind:value={$firstName.value}
            errors={$firstName.errors}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            title={capital(capital($_("surname")))}
            id="last-name"
            startValue={employee?.surname}
            bind:value={$lastName.value}
            errors={$lastName.errors}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("nickname_givenname", { values: { n: 2 } }))}
            id="nickname-first-name"
            startValue={employee?.nickname_givenname}
            extra_classes="basis-1/2"
          />
          <Input
            title={capital($_("nickname_surname"))}
            id="nickname-last-name"
            startValue={employee?.nickname_surname}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("employee", { values: { n: 1 } }) },
          })
        )}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
