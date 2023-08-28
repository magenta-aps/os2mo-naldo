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
  import { FacetAndOrgDocument, CreateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import {activeOrgTab} from "$lib/stores/tab";


  let fromDate: string
  let toDate: string
  let employeeUuid: string
  let associationType: string
  let primary: string

  gql`
    query FacetAndOrg($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["association_type", "primary_type"]) {
        uuid
        user_key
        classes {
          name
          uuid
          user_key
        }
      }
      org_units(uuids: $uuid, from_date: $fromDate) {
        objects {
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
            type: "organisation",
            tab: $activeOrgTab,
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( FacetAndOrgDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const facets = data.facets}
  {@const minDate = data.org_units[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.org_units[0].objects[0].validity?.to?.split("T")[0]}

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
            max={maxDate
              ? maxDate
              : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          />
          <!-- These inputs needs to change, so their dates 
            can only be in the registrations of their parent org -->
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={fromDate}
            max={maxDate
              ? maxDate
              : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          />
        </div>
        <!-- We need some sort of input, to choose an employee.
          Hopefully we can do it with GraphQL soon :copium: -->
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          bind:value={employeeUuid}
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
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
