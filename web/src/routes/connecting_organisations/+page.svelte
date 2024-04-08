<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/Error.svelte"
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

    query RelatedUnitsOrgTree($fromDate: DateTime!) {
      org_units(filter: { parents: null, from_date: $fromDate }) {
        objects {
          validities {
            name
            uuid
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

  const fetchOrgTree = async (fromDate: string) => {
    const res = await graphQLClient().request(RelatedUnitsOrgTreeDocument, {
      fromDate: $date,
    })

    for (let org of res.org_units.objects) {
      orgTree.push({
        uuid: org.validities[0].uuid,
        name: org.validities[0].name,
        children: org.validities[0].children,
        fromDate: fromDate,
      })
    }
    return orgTree.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
  }

  const fetchRelatedUnits = async (originUuid: string) => {
    try {
      const response = await graphQLClient().request(RelatedUnitsDocument, {
        org_unit: originUuid,
        fromDate: $date,
      })
      relatedUnits = response.related_units.objects
      updateSelectedDestinationUuids()
    } catch (err) {
      console.error(err)
      $error = { message: err }
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
        $error = { message: err }
      }
    }

  const fetchAll = async () => {
    await graphQLClient().request(RelatedUnitsDocument, { fromDate: $date })
    await fetchOrgTree($date)
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

  $: isDisabled = !selectedOriginOrg

  $: connectionText = `${
    selectedOriginOrg
      ? selectedOriginOrg.name
      : capital($_("unit", { values: { n: 0 } }))
  } ${$_("connect_with")} ${formatDestinationNamesFromOrgs(selectedDestinationsOrgs)}`

  const formatDestinationNamesFromOrgs = (orgs: { name: string }[]): string => {
    const names = orgs.map((org) => org.name)

    if (!names.length) return ""
    return names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} ${$_("and")} ${names[names.length - 1]}`
  }

  const resetSelected = () => {
    selectedOriginOrg = null
    selectedDestinationsOrgs = []
  }

  onDestroy(resetSelected) //reset selected-values when closing the page
</script>

{#await fetchAll()}
  <p>{capital($_("loading"))}</p>
{:then data}
  <title>{$_("navigation.connecting_organisations")} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">{$_("navigation.connecting_organisations")}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class=" min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-col sm:flex-row gap-6 w-full">
          <div class="w-1/2">
            <CheckboxOrgTree
              allowMultipleSelection={false}
              bind:orgTree
              bind:selectedDestinationsOrgs
              bind:selectedOriginOrg
              title="{capital($_('specify'))} {$_('unit', { values: { n: 1 } })}"
            />
            <!-- FIXME: -->
            <!-- Hidden field for origin-uuid -->
            <input
              type="hidden"
              id="origin-uuid"
              name="origin-uuid"
              value={selectedOriginOrg ? selectedOriginOrg.uuid : ""}
            />
          </div>
          <div class="w-1/2">
            <CheckboxOrgTree
              allowMultipleSelection={true}
              bind:orgTree
              bind:selectedDestinationsOrgs
              bind:selectedOriginOrg
              title={selectedOriginOrg
                ? `${capital($_("connection_text"))} ${selectedOriginOrg.name}`
                : `${capital($_("specify"))} ${$_("unit", { values: { n: 2 } })}`}
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
    <div class="py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        disabled={isDisabled}
        >{capital($_("save"))}
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        disabled={isDisabled}
        on:click={() => history.back()}
      >
        {capital($_("cancel"))}
      </button>
      <Error />
    </div>
  </form>
{/await}
