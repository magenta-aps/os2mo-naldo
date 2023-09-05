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
  import { getITUserITSystemName } from "$lib/util/helpers"
  import {
    FacetClassesAndEmployeeDocument,
    CreateItAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import {
    getClassUuidByUserKey,
    getClassesByFacetUserKey,
  } from "$lib/util/get_classes"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"

  let fromDate: string
  let toDate: string
  let orgUnitUuid: string
  let itUserUuid: string
  let jobFunction: string

  gql`
    query FacetClassesAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: "engagement_job_function") {
        uuid
        user_key
        classes {
          user_key
          name
          uuid
        }
      }
      classes(user_keys: ["primary", "non-primary"]) {
        uuid
        user_key
      }
      employees(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          name
          itusers {
            itsystem {
              name
            }
            user_key
            uuid
          }
          validity {
            from
            to
          }
        }
      }
    }

    mutation CreateITAssociation($input: ITAssociationCreateInput!) {
      itassociation_create(input: $input) {
        objects {
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
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(CreateItAssociationDocument, {
            input: result.data,
          })
          $success = {
            message: `Tilknytning til ${mutation.itassociation_create.objects[0].employee[0].name} er blevet oprettet`,
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

{#await graphQLClient().request( FacetClassesAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const itusers = data.employees[0].objects[0].itusers}
  {@const primaryClasses = data.classes}
  {@const employeeName = data.employees[0].objects[0].name}
  {@const minDate = data.employees[0].objects[0].validity.from.split("T")[0]}

  <title>Opret IT-tilknytning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret IT-tilknytning</h3>
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
          <!-- These inputs needs to change, so their dates 
            can only be in the registrations of their parent org -->
          <!-- And I guess they also need to be dynamic, so they change depending
          which org_unit has been chosen -->
          <DateInput bind:value={toDate} title="Slutdato" id="to" min={fromDate} />
        </div>
        <!-- We need some sort of input, to choose an employee.
          Hopefully we can do it with GraphQL soon :copium: -->
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          startValue={employeeName}
          value={undefined}
          disabled
        />
        <Input
          title="Organisationsenhed UUID"
          id="org-unit-uuid"
          bind:value={orgUnitUuid}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            bind:value={itUserUuid}
            title="IT-konto"
            id="it-user-uuid"
            iterable={getITUserITSystemName(itusers)}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title="Stillingsbetegnelse"
            id="job-function"
            bind:value={jobFunction}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            required={true}
            extra_classes="basis-1/2"
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
            value={getClassUuidByUserKey(primaryClasses, "primary")}
            extra_classes="checkbox-primary"
          />
          <input
            hidden
            name="non-primary"
            id="non-primary"
            value={getClassUuidByUserKey(primaryClasses, "non-primary")}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret IT-tilknytning</button
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
