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
    FacetAndEmployeeDocument,
    CreateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"

  let fromDate: string
  let toDate: string
  let orgUnitUuid: string
  let associationType: string
  let primary: string

  gql`
    query FacetAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["association_type", "primary_type"]) {
        uuid
        user_key
        classes {
          user_key
          name
          uuid
        }
      }
      employees(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          name
          validity {
            from
            to
          }
        }
      }
    }

    mutation CreateAssociation($input: AssociationCreateInput!) {
      association_create(input: $input) {
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
          const mutation = await graphQLClient().request(CreateAssociationDocument, {
            input: result.data,
          })
          $success = {
            message: `Tilknytning til ${mutation.association_create.objects[0].employee[0].name} er blevet oprettet`,
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

{#await graphQLClient().request( FacetAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const employeeName = data.employees[0].objects[0].name}
  {@const minDate = data.employees[0].objects[0].validity.from.split("T")[0]}

  <title>Opret tilknytning | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Opret tilknytning</h3>
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
            title="Tilknytningsrolle"
            id="association-type"
            bind:value={associationType}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Select
            title="Primær"
            id="primary"
            bind:value={primary}
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret tilknytning</button
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
