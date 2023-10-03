<script lang="ts">
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { RelatedUnitsDocument, UpdateRelatedUnitsDocument } from "./query.generated"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import {
    selectedDestinationUuids,
    selectedOriginUuid,
  } from "$lib/stores/selectedItem"

  let relatedUnits: any[] = []
  let previousUuid: string | null = null
  /* let fromDate = new Date().toISOString().split("T")[0] */
  let parent: { name: string; uuid?: any | null }
  let isDisabled = true

  gql`
    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime) {
      related_units(filter: { org_units: $org_unit, from_date: $fromDate }) {
        objects {
          objects {
            org_units {
              name
              uuid
            }
            validity {
              from
              to
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
      if (result.type !== "success" || !result.data) return

      try {
        const mutation = await graphQLClient().request(UpdateRelatedUnitsDocument, {
          input: result.data,
        })
        /* TODO: lav en brugbar besked til succes-besked */
        $success = {
          message: `Tilknytning er blevet oprettet`,
        }
      } catch (err) {
        console.error(err)
        $error = { message: err as string }
      }
    }

  /*  TODO:ryd op i console.log når alt virker som det skal, disse skal ændres til <div on:change={handleInputChange}> om selectrees? */
  function handleCheckboxChangeFromSelectTree(event: CustomEvent) {
    console.log("event revived from checbox on page", event.detail)
  }

  function handleRadioChangeFromSelectTree(event: CustomEvent) {
    console.log("event revived from radio on page", event.detail)
  }

  async function fetchRelatedUnits(originUUID: string) {
    try {
      const response = await graphQLClient().request(RelatedUnitsDocument, {
        org_unit: originUUID,
        fromDate: $date,
      })
      relatedUnits = response.related_units.objects
      updateSelectedDestinationUuids()
    } catch (err) {
      console.error(err)
      $error = { message: err as string }
    }
  }

  const updateSelectedDestinationUuids = () => {
    const newDestinations = relatedUnits.flatMap((related) => {
      const related_unit = related.objects[0]
      if (related_unit.org_units[0].uuid === $selectedOriginUuid?.uuid) {
        return {
          uuid: related_unit.org_units[1].uuid,
          name: related_unit.org_units[1].name,
        }
      }
      return {
        uuid: related_unit.org_units[0].uuid,
        name: related_unit.org_units[0].name,
      }
    })
    selectedDestinationUuids.set(newDestinations)
  }

  $: if ($selectedOriginUuid && $selectedOriginUuid.uuid !== previousUuid) {
    selectedDestinationUuids.set([])
    fetchRelatedUnits($selectedOriginUuid.uuid)
    previousUuid = $selectedOriginUuid.uuid
  }

  $: originName = $selectedOriginUuid ? $selectedOriginUuid.name : "Enheden"

  $: destinationNames = $selectedDestinationUuids.map((dest) => dest.name)

  $: isDisabled = !$selectedOriginUuid || $selectedOriginUuid.uuid === "hiddenValue"

  $: connectionText = originName
    ? `${originName} kobles sammen med: ${
        destinationNames.length
          ? destinationNames.length > 1
            ? destinationNames.slice(0, -1).join(", ") +
              " og " +
              destinationNames[destinationNames.length - 1]
            : destinationNames[0]
          : ""
      }`
    : ""
</script>

{#await graphQLClient().request(RelatedUnitsDocument, { fromDate: $date })}
  Henter data...
{:then data}
  <title>Organisationssammenkobling | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Organisationssammenkobling</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class=" min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-col sm:flex-row gap-6 w-full">
          <input type="hidden" name="from" bind:value={$date} />
          <!-- Skjult radioButton der tvinger brugerne til at vælge en værdi til at starte med, og til at disable 'gem' og 'anullér' knapperne-->
          <input
            type="radio"
            name="originUuid"
            id="hiddenRadioButton"
            value="hiddenValue"
            checked
            hidden
          />
          <!-- TODO: træet skal foldes ud så man kan se hvad der er markert, hvis der findes indhold i selectedDestinationUuids-->
          <div class="flex flex-col w-1/2">
            <SelectOrgTree
              isCheckboxMode={true}
              allowMultipleSelection={false}
              bind:selectedOrg={parent}
              labelText="Vælg enhed"
              on:radioChanged={handleRadioChangeFromSelectTree}
            />

            <!-- Skjult felt for origin-uuid -->
            <input
              type="hidden"
              id="origin-uuid"
              name="origin-uuid"
              value={$selectedOriginUuid ? $selectedOriginUuid.uuid : ""}
            />
          </div>
          <div class="flex flex-col w-1/2">
            <SelectOrgTree
              isCheckboxMode={true}
              allowMultipleSelection={true}
              bind:selectedOrg={parent}
              labelText="Angiv hvilke enheder der skal sammenkobles med enheden til venstre"
              on:checkboxChanged={handleCheckboxChangeFromSelectTree}
            />
            <!-- Skjult felt for destination-uuids -->
            <input
              type="hidden"
              id="destination-uuids"
              name="destination-uuids"
              value={$selectedDestinationUuids.map((obj) => obj.uuid).join(",")}
            />
          </div>
        </div>
        <div class="text-sm text-secondary pb-1">{connectionText}</div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        disabled={isDisabled}>Gem</button
      >
      <!--  TODO:hvor skal goto: vise hen, hvis den skal vise nogle steder hen? -->
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        disabled={isDisabled}
        on:click={() => goto(`${base}/connecting-organisations/`)}
      >
        Annullér
      </button>
      <Error />
    </div>
  </form>
{/await}
