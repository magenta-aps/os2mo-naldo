<script lang="ts">
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree.js"
  import Node from "$lib/components/org/tree/node.svelte"
  import { success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"
  import { globalNavigation } from "$lib/stores/navigation"
  import { gql } from "graphql-request"
  import { OrgUnitsWithChildrenDocument } from "./query.generated"

  // First load from index
  const fetchOrgTree = async (fromDate: string, childUuid?: string | null) => {
    gql`
      query OrgUnitsWithChildren($fromDate: DateTime) {
        org_units(filter: { parents: null, from_date: $fromDate }) {
          objects {
            objects {
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
    `

    // Breadcrumbs
    const res = await graphQLClient().request(OrgUnitsWithChildrenDocument, {
      fromDate: fromDate,
    })

    const orgTree = []
    const uuid = childUuid ? childUuid : $page.params.uuid

    // Will return an empty list of "breadcrumbs" if the route isn't under organisation
    // or it doesn't have UUID
    const breadcrumbs =
      $page.route.id?.startsWith("/organisation") && uuid
        ? (await fetchParentTree(uuid, fromDate)).map((e) => e.uuid).reverse()
        : []

    for (let org of res.org_units.objects) {
      orgTree.push({
        uuid: org.objects[0].uuid,
        name: org.objects[0].name,
        children: org.objects[0].children,
        breadcrumbs: breadcrumbs,
        fromDate: fromDate,
      })
    }
    return orgTree
  }

  let refreshableOrgTree = fetchOrgTree($date)

  $: refreshableOrgTree = fetchOrgTree($date)

  // TODO: Replace with subscriptions when implmented
  $: if ($success.type === "organisation") {
    refreshableOrgTree = fetchOrgTree($date, $success.uuid)
  }

  // Triggered when using the global navigation to find an organisation
  $: if ($globalNavigation) {
    refreshableOrgTree = fetchOrgTree($date, $globalNavigation.uuid)
  }
</script>

{#await refreshableOrgTree}
  <div role="status" class="max-w-sm animate-pulse">
    <div class="h-10 bg-base-100 rounded dark:bg-accent max-w-4 mb-2.5" />
    <span class="sr-only">Loading...</span>
  </div>
{:then orgTree}
  {#each orgTree as child}
    <Node {...child} />
  {/each}
{/await}
