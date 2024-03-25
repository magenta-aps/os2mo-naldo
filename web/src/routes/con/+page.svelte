<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/error.svelte"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree.js"
  import Node from "./node.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { error, success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import {
    OrgUnitsWithChildrenDocument,
    UpdateRelatedUnitsDocument,
    RelatedUnitsDocument,
  } from "./query.generated"

  let selectedOriginOrg: string | null = null
  let selectedDestinationOrgs: string[] = []

  gql`
    query OrgUnitsWithChildren($fromDate: DateTime) {
      org_units(filter: { parents: null, from_date: $fromDate }) {
        objects {
          validities {
            name
            uuid
            children(limit: 1) {
              uuid
            }
          }
        }
      }
    }

    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime) {
      related_units(filter: { org_unit: { uuids: $org_unit }, from_date: $fromDate }) {
        objects {
          validities {
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
  const fetchOrgTree = async (fromDate: string, childUuid?: string | null) => {
    const res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
      fromDate: fromDate,
    })

    const orgTree = []
    const uuid = childUuid ? childUuid : $page.params.uuid

    for (let org of res.org_units.objects) {
      orgTree.push({
        uuid: org.validities[0].uuid,
        name: org.validities[0].name,
        children: org.validities[0].children,
        fromDate: fromDate,
      })
    }
    return orgTree.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
  }

  let refreshableOrgTree = fetchOrgTree($date, null)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateRelatedUnitsDocument, {
            input: result.data,
          })
          $success = {
            message: "Virker",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }
  const updateDestinationUuids = async (fromDate: string, originUuid: string) => {
    const res = await graphQLClient().request(RelatedUnitsDocument, {
      fromDate: fromDate,
      org_unit: originUuid,
    })
    const newDestinations = res.related_units.objects.flatMap((related) => {
      const related_unit = related.validities[0]
      return selectedOriginOrg === related_unit.org_units[0].uuid
        ? related_unit.org_units[1].uuid
        : related_unit.org_units[0].uuid
    })
    selectedDestinationOrgs = [...newDestinations]
    return selectedDestinationOrgs
    // TODO: Når denne skifter, skal der laves ny query og ticke checkboxes?
  }

  const handleRadioChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    selectedOriginOrg = target.id
    updateDestinationUuids($date, selectedOriginOrg)
  }

  // Maybe this is useless
  const handleCheckboxChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      selectedDestinationOrgs = [...selectedDestinationOrgs, target.id]
    } else {
      selectedDestinationOrgs = selectedDestinationOrgs.filter(
        (org) => org !== target.id
      )
    }
  }
</script>

<title>{$_("navigation.connecting_organisations")} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{$_("navigation.connecting_organisations")}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  {#await refreshableOrgTree}
    <p>{capital($_("loading"))}</p>
  {:then orgTree}
    <div class=" min-w-fit bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-col sm:flex-row gap-6 w-full">
          <div class="w-1/2">
            <ul class="menu pt-6 px-4 overflow-y-auto bg-base-100 text-base-content">
              {#each orgTree as child}
                <!-- bind value -->
                <div on:change={handleRadioChange} class="ml-2">
                  <Node {...child} type="radio" {selectedOriginOrg} />
                </div>
              {/each}
            </ul>
          </div>
          <div class="w-1/2">
            <ul class="menu pt-6 px-4 overflow-y-auto bg-base-100 text-base-content">
              {#each orgTree as child}
                <div on:change={handleCheckboxChange} class="ml-2">
                  <Node {...child} type="checkbox" {selectedDestinationOrgs} />
                </div>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/await}
  <div class="py-6 gap-4">
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >{capital($_("save"))}
    </button>
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      on:click={() => history.back()}
    >
      {capital($_("cancel"))}
    </button>
  </div>
</form>
