<script lang="ts">
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "../connecting_organisations/$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { error, success } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import {
    RelatedUnitsDocument,
    RelatedUnitsOrgTreeDocument,
    UpdateRelatedUnitsDocument,
  } from "./query.generated"
  import CheckboxOrgTree from "./checkbox_tree/checkbox_org_tree.svelte"
  import { onDestroy } from "svelte"

  export let orgTree: any[] = []
  export let selectedOriginOrg: { uuid: string; name: string } | null = null
  export let selectedDestinationsOrgs: { uuid: string; name: string }[] = []

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

    query RelatedUnitsOrgTree($from_date: DateTime!) {
      org_units(filter: { from_date: $from_date }) {
        objects {
          uuid
          objects {
            name
            uuid
            parent {
              name
              uuid
            }
            children {
              name
              uuid
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

  const fetchOrgTree = async () => {
    const data = await graphQLClient().request(RelatedUnitsOrgTreeDocument, {
      from_date: $date,
    })
    if (data.org_units) {
      const orgUnitList: any[] = []
      for (let org of data.org_units.objects) {
        orgUnitList.push({
          uuid: org.uuid,
          parentUuid: org.objects[0].parent?.uuid,
          name: org.objects[0].name,
          fromDate: $date,
        })
      }
      orgTree = convertListToTree(orgUnitList)
    }
  }

  const convertListToTree = (orgUnitList: any[]) => {
    // Converts a flat list of org units to a tree of org units. This ensures that the organisation and its structure only need to be fetched once
    // Each node in the org unit tree gets a "children" attribute containing its children.
    // Source: https://stackoverflow.com/a/40732240

    const dataTree: any[] = [] // Variable holding the resulting tree
    const hashTable = Object.create(null) // Temporary holding place used in the main loop

    // Add an empty list called "children" to each org unit in the flat list
    orgUnitList.forEach(
      (orgUnit) => (hashTable[orgUnit.uuid] = { ...orgUnit, children: [] })
    )
    // Convert flat list to tree
    orgUnitList.forEach((orgUnit) => {
      if (orgUnit.parentUuid) {
        // Add (another) child to the parent org unit
        hashTable[orgUnit.parentUuid].children.push(hashTable[orgUnit.uuid])
      } else {
        // Add (another) root node to the top of the tree
        dataTree.push(hashTable[orgUnit.uuid])
      }
    })
    return dataTree
  }

  async function fetchRelatedUnits(originUuid: string) {
    try {
      const response = await graphQLClient().request(RelatedUnitsDocument, {
        org_unit: originUuid,
        fromDate: $date,
      })
      relatedUnits = response.related_units.objects
      updateSelectedDestinationUuids()
    } catch (err) {
      console.error(err)
      $error = { message: err as string }
    }
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type !== "success" || !result.data) return

      if (!selectedOriginOrg) {
        console.warn("selectedOriginOrg is null or undefined")
        return
      }

      try {
        const mutation = await graphQLClient().request(UpdateRelatedUnitsDocument, {
          input: result.data,
        })
        // Check if selectedDestinationsOrgs is empty to determine which success message should be sent.
        if (selectedDestinationsOrgs.length === 0) {
          $success = {
            message: `Alle tilknytninger til ${selectedOriginOrg.name} blev fjernet.`,
          }
        } else {
          $success = {
            message: `${
              selectedOriginOrg.name
            } blev knyttet sammen med: ${formatDestinationNamesFromOrgs(
              selectedDestinationsOrgs
            )}`,
          }
        }
      } catch (err) {
        console.error(err)
        $error = { message: err as string }
      }
    }

  const fetchAll = async () => {
    await graphQLClient().request(RelatedUnitsDocument, { fromDate: $date })
    await fetchOrgTree()
  }

  const updateSelectedDestinationUuids = () => {
    const newDestinations = relatedUnits.flatMap((related) => {
      const related_unit = related.objects[0]
      if (related_unit.org_units[0].uuid !== selectedOriginOrg?.uuid) {
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

    selectedDestinationsOrgs = [...newDestinations]
    return selectedDestinationsOrgs
  }

  $: if (selectedOriginOrg && selectedOriginOrg.uuid !== previousUuid) {
    fetchRelatedUnits(selectedOriginOrg.uuid)
    previousUuid = selectedOriginOrg.uuid
  }

  $: originName = selectedOriginOrg ? selectedOriginOrg.name : "Enheden"

  $: isDisabled = !selectedOriginOrg

  $: connectionText = `${originName} kobles sammen med: ${formatDestinationNamesFromOrgs(
    selectedDestinationsOrgs
  )}`

  function formatDestinationNamesFromOrgs(orgs: { name: string }[]): string {
    const names = orgs.map((org) => org.name)

    if (!names.length) return ""
    return names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`
  }

  onDestroy(resetSelected) //reset selected when closening the page

  function resetSelected() {
    selectedOriginOrg = null
    selectedDestinationsOrgs = []
  }
</script>

{#await fetchAll()}
  Henter data...
  <span class="animate-spin rounded-full h-6 w-6 border-b-4 border-primary" />
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

          <div class="flex flex-col w-1/2">
            <CheckboxOrgTree
              allowMultipleSelection={false}
              bind:orgTree
              bind:selectedDestinationsOrgs
              bind:selectedOriginOrg
              labelText="Vælg enhed"
            />
            <!-- Hidden field for origin-uuid -->
            <input
              type="hidden"
              id="origin-uuid"
              name="origin-uuid"
              value={selectedOriginOrg ? selectedOriginOrg.uuid : ""}
            />
          </div>
          <div class="flex flex-col w-1/2">
            <CheckboxOrgTree
              allowMultipleSelection={true}
              bind:orgTree
              bind:selectedDestinationsOrgs
              bind:selectedOriginOrg
              labelText="Angiv hvilke enheder der skal sammenkobles med enheden til venstre"
            />
            <input
              type="hidden"
              id="destination-uuids"
              name="destination-uuids"
              value={JSON.stringify(selectedDestinationsOrgs)}
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
      <!-- TODO: Where should goto: point to, if it's supposed to point somewhere? -->
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
