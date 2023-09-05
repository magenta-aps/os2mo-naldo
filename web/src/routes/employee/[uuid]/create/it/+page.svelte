<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import {
    ItSystemsClassAndEmployeeDocument,
    CreateItUserDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { getClassUuidByUserKey } from "$lib/util/get_classes"

  let fromDate: string
  let toDate: string
  let itSystem: string
  let accountName: string

  gql`
    query ItSystemsClassAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
      itsystems {
        name
        uuid
      }
      classes(user_keys: ["primary", "non-primary"]) {
        uuid
        user_key
      }
      employees(uuids: $uuid, from_date: $fromDate) {
        objects {
          validity {
            from
            to
          }
        }
      }
    }

    mutation CreateItUser($input: ITUserCreateInput!) {
      ituser_create(input: $input) {
        objects {
          employee {
            name
          }
          itsystem {
            name
          }
        }
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(CreateItUserDocument, {
            input: result.data,
          })
          $success = {
            message: `IT-konto er oprettet ${
              mutation.ituser_create.objects[0]?.employee
                ? `for ${mutation.ituser_create.objects[0].employee[0].name}`
                : ""
            }`,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( ItSystemsClassAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const itSystems = data.itsystems}
  {@const classes = data.classes}
  {@const minDate = data.employees[0].objects[0].validity?.from.split("T")[0]}

  <title>Opret IT-konto | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret IT-konto</h3>
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
            min={minDate}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={fromDate ? fromDate : minDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="IT-system"
            id="it-system"
            bind:value={itSystem}
            iterable={itSystems.sort((a, b) => (a.name > b.name ? 1 : -1))}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            extra_classes="basis-1/2"
            title="Kontonavn"
            id="account-name"
            bind:value={accountName}
            required={true}
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
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
    <!-- TODO: Add support for adding more IT users at once -->
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret IT-konto</button
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
