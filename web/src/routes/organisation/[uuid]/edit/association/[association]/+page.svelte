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
    AssociationAndFacetDocument,
    UpdateAssociationDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"

  let fromDate: string
  let toDate: string
  let employeeUuid: string
  let associationType: string

  gql`
    query AssociationAndFacet($uuid: [UUID!], $fromDate: DateTime) {
      facets(user_keys: "association_type") {
        uuid
        user_key
        classes {
          name
          uuid
        }
      }
      associations(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          employee {
            uuid
            name
          }
          association_type {
            name
          }
          validity {
            from
            to
          }
          org_unit {
            validity {
              from
              to
            }
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
            // Hvis medarbejderen bliver ændret, så kommer det til at virke lidt funky, nu jeg tænker over det..
            // for så vil det være den "nye" medarbejders navn der vil stå der. Men ellers ret sejt imo
            message: `Tilknytning for ${mutation.association_update.objects[0].employee[0].name} er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( AssociationAndFacetDocument, { uuid: $page.params.association, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const association = data.associations[0].objects[0]}
  {@const minDate = association.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = association.org_unit[0].validity.to?.split("T")[0]}

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
            max={maxDate ? maxDate : null}
          />
          <!-- These inputs needs to change, so their dates 
          can only be in the registrations of their parent org -->
          <DateInput
            bind:value={toDate}
            startValue={association.validity.to
              ? association.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={fromDate}
            max={maxDate ? maxDate : null}
          />
        </div>
        <!-- We need some sort of input, to choose an employee.
        Hopefully we can do it with GraphQL soon :copium: -->
        <Input
          title="Medarbejder UUID"
          id="employee-uuid"
          bind:value={employeeUuid}
          startValue={association.employee[0].uuid}
          required={true}
        />
        <Select
          title="Tilknytningsrolle"
          id="association-type"
          startValue={association.association_type?.name}
          bind:value={associationType}
          iterable={data.facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
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
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
