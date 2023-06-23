<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { AssociationDocument, TerminateAssociationDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"

  let toDate: string

  gql`
    query Association($uuid: [UUID!], $fromDate: DateTime!) {
      associations(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          employee {
            uuid
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

    mutation TerminateAssociation($input: AssociationTerminateInput!) {
      association_terminate(input: $input) {
        uuid
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(TerminateAssociationDocument, {
            input: result.data,
          })

          $success = {
            message: `${name} afsluttes d. INDSÆT DATO`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${$page.params.uuid}`), 200)
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request( AssociationDocument, { uuid: $page.params.association, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const association = data.associations[0].objects[0]}
  {@const minDate = association.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = association.org_unit[0].validity.to?.split("T")[0]}

  <title>Afslut tilknytning for {association?.employee[0].name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Afslut tilknytning for {association?.employee[0].name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          bind:value={toDate}
          startValue={association.validity.to
            ? association.validity.to.split("T")[0]
            : null}
          title="Slutdato"
          id="to"
          min={minDate}
          max={maxDate ? maxDate : null}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Afslut tilknytning</button
      >
      <a
        href={`${base}/organisation/${$page.params.uuid}`}
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        >Annullér</a
      >
    </div>
    <Error />
  </form>
{/await}
