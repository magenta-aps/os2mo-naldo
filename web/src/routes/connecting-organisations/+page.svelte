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
  import {
    RelatedUnitsDocument,
    OrgTreeRelatedDocument,
    UpdateRelatedUnitsDocument,
  } from "./query.generated"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import {
    selectedDestinationUuids,
    selectedOriginUuid,
  } from "$lib/stores/selectedItem"

  let relatedUnits: any[] = []
  let previousUuid: string | null = null
  let fromDate = new Date().toISOString().split("T")[0]
  let parent: { name: string; uuid?: any | null }
  let isDisabled = true

  /* TODO: er der brug for begge gql-query */
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

  /*  TODO: sammenskriv handleRadioChange og handleCheckboxChange til en funktion? */
  const handleRadioChange = (event: CustomEvent) => {
    const isChecked = event.detail.isChecked
    selectedOriginUuid.set({ uuid: parent.uuid, name: parent.name })
    fetchRelatedUnits(parent.uuid)
  }

  const handleCheckboxChange = (event: CustomEvent) => {
    const isChecked = event.detail.isChecked

    selectedDestinationUuids.update((currentDestinations) => {
      if (isChecked) {
        return [...currentDestinations, { uuid: parent.uuid, name: parent.name }]
      } else {
        return currentDestinations.filter((org) => org.uuid !== parent.uuid)
      }
    })
  }

  async function fetchRelatedUnits(originUUID: string) {
    try {
      const response = await graphQLClient().request(RelatedUnitsDocument, {
        org_unit: originUUID,
        fromDate: fromDate,
      })
      relatedUnits = response.related_units.objects

      updateSelectedDestinationUuids()
    } catch (err) {
      console.error(err)
      $error = { message: err as string }
    }
  }

  const updateSelectedDestinationUuids = () => {
    relatedUnits.forEach((related) => {
      const related_unit = related.objects[0]
      let relatedUuid: string
      let relatedName: string

      if (related_unit.org_units[0].uuid === $selectedOriginUuid?.uuid) {
        relatedUuid = related_unit.org_units[1].uuid
        relatedName = related_unit.org_units[1].name
      } else {
        relatedUuid = related_unit.org_units[0].uuid
        relatedName = related_unit.org_units[0].name
      }

      selectedDestinationUuids.update((currentDestinations) => {
        if (!currentDestinations.some((dest) => dest.uuid === relatedUuid)) {
          return [...currentDestinations, { uuid: relatedUuid, name: relatedName }]
        } else {
          return currentDestinations
        }
      })
    })
  }

  $: if ($selectedOriginUuid && $selectedOriginUuid.uuid !== previousUuid) {
    selectedDestinationUuids.set([])
    fetchRelatedUnits($selectedOriginUuid.uuid)
    previousUuid = $selectedOriginUuid.uuid
  }

  $: originName = $selectedOriginUuid ? $selectedOriginUuid.name : "Enheden"
  $: destinationNames = $selectedDestinationUuids.map((dest) => dest.name)

  $: isDisabled = !$selectedOriginUuid || $selectedOriginUuid.uuid === "hiddenValue"
</script>

{#await graphQLClient().request(OrgTreeRelatedDocument, { from_date: $date })}
  Henter data...
{:then data}
  <!-- TODO: tekst skal muligvis rykkes til script? -->
  <!-- TODO: Der skal laces  om i stylingen af siden -->
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
          <!-- Skjult radioButton der tvinger brugerne til at vælge en værdi til at starte med, og til at disable 'gem' og 'anullér' knapperne-->
          <input
            type="radio"
            name="originUuid"
            id="hiddenRadioButton"
            value="hiddenValue"
            checked
            hidden
          />
          <!-- TODO: skal træet skal foldes ud til at vise de markerede enheder når origin er valgt -->
          <!-- TODO: højre side skal deaktiveres indtil der er valgt en origin -->
          <SelectOrgTree
            {relatedUnits}
            isCheckboxMode={true}
            allowMultipleSelection={false}
            bind:selectedOrg={parent}
            labelText="Vælg enhed"
            on:radioChanged={handleRadioChange}
          />

          <!-- Skjult felt for origin-uuid -->
          <input
            type="hidden"
            id="origin-uuid"
            name="origin-uuid"
            value={$selectedOriginUuid ? $selectedOriginUuid.uuid : ""}
          />

          <SelectOrgTree
            isCheckboxMode={true}
            allowMultipleSelection={true}
            bind:selectedOrg={parent}
            labelText="Angiv hvilke enheder der skal sammenkobles med enheden til venstre"
            on:checkboxChanged={handleCheckboxChange}
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
      </div>
    </div>
  </form>
{/await}
