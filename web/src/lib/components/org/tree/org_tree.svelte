<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import { fetchParentTree } from "$lib/util/parent_tree"
  import Node from "$lib/components/org/tree/node.svelte"

  // First load from index
  const fetchOrgTree = async (): Promise<any[]> => {
    const query = `{
      org_units(parents: null) {
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

    const breadcrumbs = (await fetchParentTree($page.params.uuid))
      .map((e) => e.uuid)
      .reverse()

    for (let org of json.data.org_units) {
      orgTree.push({
        uuid: org.objects[0].uuid,
        name: org.objects[0].name,
        children: org.objects[0].children,
        breadcrumbs: breadcrumbs,
      })
    }
    return orgTree
  }
</script>

{#await fetchOrgTree()}
  <div role="status" class="max-w-sm animate-pulse">
    <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-4 mb-2.5" />
    <span class="sr-only">Loading...</span>
  </div>
{:then orgTree}
  <ul class="dropdown-content menu rounded-box w-full">
    {#each orgTree as child}
      <Node {...child} />
    {/each}
  </ul>
{/await}
