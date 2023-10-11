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
  import CheckboxOrgTree from "./checkbox_tree/checkbox_org_tree.svelte"
  import { onDestroy } from "svelte"
  import { selectedDestinationsOrgs, selectedOriginOrg } from "$lib/stores/selectedOrg"

  let relatedUnits: any[] = []
  let previousUuid: string
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
        $success = {
          message: `Tilknytningen blev redigeret`,
        }
      } catch (err) {
        console.error(err)
        $error = { message: err as string }
      }
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
      if (related_unit.org_units[0].uuid !== $selectedOriginOrg?.uuid) {
        return {
          uuid: related_unit.org_units[0].uuid,
          name: related_unit.org_units[0].name,
        }
      } else {
        return {
          uuid: related_unit.org_units[1].uuid,
          name: related_unit.org_units[1].name,
        }
      }
    })
    selectedDestinationsOrgs.set(newDestinations)
  }

  //Ikke svelte-korrekt men kunne ikke få andet til at fungere, sætter hiddenRadioButton som valgt når selectedOriginOrg=null
  $: if (!$selectedOriginOrg) {
    const hiddenRadioButton = document.getElementById(
      "hiddenRadioButton"
    ) as HTMLInputElement
    if (hiddenRadioButton) {
      hiddenRadioButton.checked = true
    }
  }

  $: if ($selectedOriginOrg && $selectedOriginOrg.uuid !== previousUuid) {
    fetchRelatedUnits($selectedOriginOrg.uuid)
    previousUuid = $selectedOriginOrg.uuid
  }

  $: originName = $selectedOriginOrg ? $selectedOriginOrg.name : "Enheden"

  $: destinationNames = $selectedDestinationsOrgs.map((dest) => dest.name)

  $: isDisabled = !$selectedOriginOrg || $selectedOriginOrg.uuid === "hiddenValue"

  $: connectionText = originName
    ? `${originName} kobles sammen med: ${formatDestinationNames(destinationNames)}`
    : ""

  function formatDestinationNames(names: string[]): string {
    if (!names.length) return ""
    return names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`
  }

  onDestroy(resetStore)

  function resetStore() {
    selectedOriginOrg.set(null)
    selectedDestinationsOrgs.set([])
  }
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
          <!-- Skjult radioButton der tvinger bruger til at vælge en værdi, og til at disable 'gem' og 'annullér' knapperne-->
          <input
            type="radio"
            name="originUuid"
            id="hiddenRadioButton"
            value="hiddenValue"
            checked
            hidden
          />
          <div class="flex flex-col w-1/2">
            <CheckboxOrgTree allowMultipleSelection={false} labelText="Vælg enhed" />
            <!-- Skjult felt for origin-uuid -->
            <input
              type="hidden"
              id="origin-uuid"
              name="origin-uuid"
              value={$selectedOriginOrg ? $selectedOriginOrg.uuid : ""}
            />
          </div>
          <div class="flex flex-col w-1/2">
            <CheckboxOrgTree
              allowMultipleSelection={true}
              labelText="Angiv hvilke enheder der skal sammenkobles med enheden til venstre"
            />
            <!-- Skjult felt for destination-uuids -->
            <input
              type="hidden"
              id="destination-uuids"
              name="destination-uuids"
              value={$selectedDestinationsOrgs.map((obj) => obj.uuid).join(",")}
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
        disabled={isDisabled}
        >Gem
      </button>
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
