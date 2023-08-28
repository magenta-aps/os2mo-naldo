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
    AssociationAndFacetsDocument,
    UpdateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import {activeEmployeeTab} from "$lib/stores/tab";

  let fromDate: string
  let toDate: string
  let employeeUuid: string
  let orgUnitUuid: string
  let associationType: string
  let primary: string

  gql`
    query AssociationAndFacets($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: ["association_type", "primary_type"]) {
        uuid
        user_key
        classes {
          uuid
          user_key
          name
        }
      }
      associations(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          employee {
            uuid
            name
            validity {
              from
              to
            }
          }
          org_unit {
            uuid
          }
          association_type {
            name
          }
          primary {
            uuid
            name
          }
          validity {
            from
            to
          }
        }
      }
    }

    mutation UpdateAssociation($input: AssociationUpdateInput!) {
      association_update(input: $input) {
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
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateAssociationDocument, {
            input: result.data,
          })
          $success = {
            message: `Tilknytning for ${mutation.association_update.objects[0].employee[0].name} er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "employee",
            tab: $activeEmployeeTab,
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( AssociationAndFacetsDocument, { uuid: $page.params.association, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const association = data.associations[0].objects[0]}
  {@const facets = data.facets}
  {@const minDate = association.employee[0].validity.from.split("T")[0]}

  <title>Rediger {association?.employee[0].name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger {association.employee[0].name}</h3>
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
            startValue={association.validity.to
              ? association.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={fromDate}
          />
        </div>
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          bind:value={employeeUuid}
          startValue={association.employee[0].uuid}
          disabled
        />
        <Input
          title="Organisationsenhed UUID"
          id="org-unit-uuid"
          bind:value={orgUnitUuid}
          startValue={association.org_unit[0].uuid}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Select
            title="Tilknytningsrolle"
            id="association-type"
            startValue={association.association_type?.name}
            bind:value={associationType}
            iterable={getClassesByFacetUserKey(facets, "association_type")}
            extra_classes="basis-1/2"
          />
          <Select
            title="Primær"
            id="primary"
            startValue={association.primary?.name}
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
        >Rediger enhed</button
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
