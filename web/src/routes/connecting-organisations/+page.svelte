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
  import { OrgTreeRelatedDocument, UpdateRelatedUnitsDocument } from "./query.generated"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import {
    selectedDestinationUuids,
    selectedOriginUuid,
  } from "$lib/stores/selectedItem"

  let destinationUuids: string[] = []
  let originUuid: string
  let relatedUnits: any[] = []

  let fromDate = new Date().toISOString().split("T")[0]
  let parent: { name: string; uuid?: any | null }

  /* TODO:ny graphQL med midre query? */
  gql`
    query OrgTreeRelated($from_date: DateTime!) {
      related_units(filter: { from_date: $from_date }) {
        objects {
          objects {
            org_units {
              uuid
              name
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
          /* TODO: Intetsigende besked ret til noget mere fornuftigt */
          $success = {
            message: `Tilknytning til ${mutation.related_units_update.uuid} er blevet oprettet`,
          }
        } catch (err) {
          console.error(err)
          $error = { message: err as string }
        }
      }
    }

  $: originName = $selectedOriginUuid ? $selectedOriginUuid.name : "Enheden"
  $: destinationNames = $selectedDestinationUuids.map((dest) => dest.name)
</script>

{#await graphQLClient().request(OrgTreeRelatedDocument, { from_date: $date })}
  Henter data...
{:then data}
  {@const related_units = data.related_units.objects}
  {(relatedUnits = related_units)}
  <!-- TODO: indlæs værdier i store, brug uuid i graph? -->

  <!-- Todo: håndter default i origin-->
  {@const connectionText = originName
    ? `${originName} kobles sammen med: ${
        destinationNames.length
          ? destinationNames.length > 1
            ? destinationNames.slice(0, -1).join(", ") +
              " og " +
              destinationNames[destinationNames.length - 1]
            : destinationNames[0]
          : ""
      }`
    : ""}

  <title>Organisationssammenkobling | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Organisationssammenkobling</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="w-1/2 min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <input type="hidden" name="from" bind:value={fromDate} />
          <!--  TODO: lav en default værdi for radioButton -->

          <SelectOrgTree
            useCheckbox={true}
            multiSelect={false}
            bind:selectedOrg={parent}
            labelText="Vælg enhed"
          />
          <!-- Skjult felt for origin-uuid -->
          <input
            type="hidden"
            id="origin-uuid"
            name="origin-uuid"
            value={$selectedOriginUuid ? $selectedOriginUuid.uuid : ""}
          />

          <SelectOrgTree
            {relatedUnits}
            useCheckbox={true}
            multiSelect={true}
            bind:selectedOrg={parent}
            labelText="Angiv hvilke enheder der skal sammenkobles med enheden til venstre"
          />
          <!-- Skjult felt for destination-uuids -->
          <input
            type="hidden"
            id="destination-uuids"
            name="destination-uuids"
            value={$selectedDestinationUuids.map((obj) => obj.uuid).join(",")}
          />
        </div>
        <div class="info-text py-2">{connectionText}</div>
        <div class="flex py-6 gap-4">
          <button
            type="submit"
            class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
            >Gem</button
          >
          <!--  TODO:hvorskal goto: vise hen? -->
          <button
            type="button"
            class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
            on:click={() => goto(`${base}/connecting-organisations/`)}
          >
            Annullér
          </button>
          <Error />
        </div>
      </div>
    </div>
  </form>

  {console.log("origin:", $selectedOriginUuid)}
  {console.log("distination:", $selectedDestinationUuids)}
  {console.log("related_units", relatedUnits)}
{/await}
