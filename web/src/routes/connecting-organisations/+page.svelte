<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { UpdateRelatedUnitsDocument, RelatedUnits2Document } from "./query.generated"

  let fromDate: string
  let destinationUuid: any[]
  let originUuid: string

  gql`
    query RelatedUnits($uuid: [UUID!], $fromDate: DateTime) {
      org_units(uuids: $uuid, from_date: $fromDate) {
        objects {
          objects {
            uuid
            user_key
            related_units {
              uuid
              user_key
              org_units {
                uuid
                user_key
              }
            }
          }
        }
      }
    }

    query RelatedUnits2($fromDate: DateTime) {
      related_units(from_date: $fromDate) {
        objects {
          objects {
            uuid
            user_key
            org_units {
              uuid
              user_key
            }
          }
        }
      }
    }

    mutation UpdateRelatedUnits($input: RelatedUnitsUpdateInput!) {
      related_units_update(input: $input) {
        uuid
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateRelatedUnitsDocument, {
            input: result.data,
          })
          $success = {
            message: `Tilknytning til ${mutation.related_units_update.uuid} er blevet oprettet`,
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }
</script>

{#await graphQLClient().request(RelatedUnits2Document, { fromDate: $date })}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {console.log(data)}

  <title>Organisationssammenkobling | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Organisationssammenkobling</h3>
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
          />
        </div>
        <Input
          title="Origin UUID"
          id="origin-uuid"
          required={true}
          bind:value={originUuid}
        />
      </div>
      <Input
        title="Distination UUID"
        id="destination-uuid"
        required={true}
        bind:value={destinationUuid[0]}
      />
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Gem</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/connecting-organisations/`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
