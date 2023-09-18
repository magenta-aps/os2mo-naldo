<script lang="ts">
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, TerminateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/search.svelte"

  let toDate: string
  let orgUnit: { name: string; uuid?: any | null }

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime!) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            name
            validity {
              from
              to
            }
            parent {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateOrgUnit($input: OrganisationUnitTerminateInput!) {
      org_unit_terminate(input: $input) {
        objects {
          uuid
          name
        }
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(TerminateOrgUnitDocument, {
            input: result.data,
          })

          $success = {
            message: `Organisationsenheden ${mutation.org_unit_terminate.objects[0].name} afsluttes d. ${toDate}`,
            uuid: mutation.org_unit_terminate.objects[0].uuid,
            type: "organisation",
          }
        } catch (err: any) {
          console.error(err)
          $error = {
            message: err.response.errors[0].extensions.error_context
              .description as string,
          }
        }
      }
    }
</script>

{#await graphQLClient().request( OrgUnitDocument, { uuid: $page.params.uuid, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const org_unit = data.org_units.objects[0].objects[0]}
  <!-- De her dates skal opdateres afhængig af hvilken org_unit man vælger, nu når det ikke skal loades ind -->
  {@const minDate = org_unit.parent?.validity.from.split("T")[0]}
  {@const maxDate = org_unit.parent?.validity.to?.split("T")[0]}

  <title>Afslut organisationsenhed | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Afslut organisationsenhed</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={$date}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
        />
        <Search type="org-unit" title="Angiv enhed" />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Afslut enhed</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => history.back()}
      >
        Annullér
      </button>
      <Error />
    </div>
  </form>
{/await}
