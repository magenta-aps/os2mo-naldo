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
    type OrgUnitsWithChildrenQuery,
  } from "./query.generated"

  // First load from index
  const fetchOrgTree = async (fromDate: string, childUuid?: string | null) => {
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
        related_units(
          filter: { org_unit: { uuids: $org_unit }, from_date: $fromDate }
        ) {
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
    return orgTree
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
                <Node {...child} type="radio" />
              {/each}
            </ul>
          </div>
          <div class="w-1/2">
            <ul class="menu pt-6 px-4 overflow-y-auto bg-base-100 text-base-content">
              {#each orgTree as child}
                <Node {...child} type="checkbox" />
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
