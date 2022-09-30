<script lang="ts">
  import { fetchGraph } from "$lib/util/http"
  import Node from "$lib/components/org/tree/node.svelte"

  let orgTree: any[] = []

  const query = `
    query {
      org_units {
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
    }`

  const fetchOrgTree = async (query: string) => {
    const res = await fetchGraph(query)
    const json = await res.json()
    if (json.data) {
      for (let org of json.data.org_units) {
        if (org.objects[0].parent === null) {
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: org.objects[0].children,
          })
        }
      }
    } else {
      throw new Error(
        json.errors
          ? json.errors[0].message
          : `Something unknown went wrong in org_tree.svelte`
      )
    }
  }
</script>

{#await fetchOrgTree(query)}
  <div role="status" class="max-w-sm animate-pulse">
    <div class="h-12 bg-base-100 rounded dark:bg-accent max-w-4 mb-2.5" />
    <span class="sr-only">Loading...</span>
  </div>
{:then}
  <ul class="dropdown-content menu rounded-box w-full">
    {#each orgTree as child}
      <Node {...child} />
    {/each}
  </ul>
{/await}
