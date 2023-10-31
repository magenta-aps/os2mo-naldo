<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import {
    ItUserItSystemsAndPrimaryDocument,
    UpdateItUserDocument,
  } from "./query.generated"
  import type { SubmitFunction } from "./$types"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { date } from "$lib/stores/date"
  import { getClassUuidByUserKey } from "$lib/util/get_classes"
  import { getITSystemNames } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const accountName = field("accountName", "", [required()])
  const svelteForm = form(fromDate, accountName)

  gql`
    query ITUserItSystemsAndPrimary(
      $uuid: [UUID!]
      $fromDate: DateTime
      $employee_uuid: [UUID!]
    ) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          uuid
          objects {
            uuid
            user_key
            primary_uuid
            itsystem {
              name
              uuid
            }
            validity {
              from
              to
            }
          }
        }
      }
      employees(filter: { uuids: $employee_uuid }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
      itsystems {
        objects {
          objects {
            name
            uuid
          }
        }
      }
      classes(filter: { user_keys: ["primary", "non-primary"] }) {
        objects {
          objects {
            uuid
            user_key
          }
        }
      }
    }

    mutation UpdateITUser($input: ITUserUpdateInput!) {
      ituser_update(input: $input) {
        objects {
          uuid
          employee {
            name
          }
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
            const mutation = await graphQLClient().request(UpdateItUserDocument, {
              input: result.data,
            })
            $success = {
              message: `IT-kontoen ${
                mutation.ituser_update.objects[0].employee
                  ? `for ${mutation.ituser_update.objects[0].employee[0].name}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

{#await graphQLClient().request( ItUserItSystemsAndPrimaryDocument, { uuid: $page.params.ituser, fromDate: $date, employee_uuid: $page.params.uuid } )}
  Henter data...
{:then data}
  {@const itUser = data.itusers.objects[0].objects[0]}
  {@const classes = data.classes.objects}
  {@const itSystems = data.itsystems.objects}
  {@const minDate = data.employees.objects[0].objects[0].validity.from.split("T")[0]}

  <title>Rediger {itUser.itsystem.name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {itUser.itsystem.name}</h3>
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
            min={minDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={itUser.validity.to ? itUser.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="IT-systemer"
            id="it-system"
            startValue={itUser.itsystem.name}
            extra_classes="basis-1/2"
            iterable={getITSystemNames(itSystems)}
            required={true}
          />
          <Input
            title="Kontonavn"
            id="account-name"
            extra_classes="basis-1/2"
            startValue={itUser.user_key}
            bind:value={$accountName.value}
            errors={$accountName.errors}
            required={true}
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
            startValue={itUser.primary_uuid}
            value={getClassUuidByUserKey(classes, "primary")}
            extra_classes="checkbox-primary"
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={getClassUuidByUserKey(classes, "non-primary")}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger IT-konto</button
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
