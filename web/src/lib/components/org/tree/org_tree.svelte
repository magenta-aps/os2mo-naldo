<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree.js"
  import Node from "$lib/components/org/tree/node.svelte"
  import { success } from "$lib/stores/alert"
  import { date } from "$lib/stores/date"

  // First load from index
  const fetchOrgTree = async (
    fromDate: string,
    childUuid?: string | null
  ): Promise<any[]> => {
    const query = `{
      org_units(parents: null, from_date: "${fromDate}") {
        objects {
          name
          uuid
          children {
            name
            uuid
          }
        }
      }
    }`

    // breadcrumbs
    const res = await fetchGraph(query)
    const json = await res.json()
    const orgTree: any[] = []

    const uuid = childUuid ? childUuid : $page.params.uuid
    const breadcrumbs = $page.route.id?.startsWith("/organisation")
      ? (await fetchParentTree(uuid, fromDate)).map((e) => e.uuid).reverse()
      : []

    for (let org of json.data.org_units) {
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
