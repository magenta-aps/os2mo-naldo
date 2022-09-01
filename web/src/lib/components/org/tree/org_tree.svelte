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
        if (!org.objects[0].parent.length) {
          orgTree.push({
            uuid: org.uuid,
            name: org.objects[0].name,
            children: org.objects[0].children,
          })
        }
      }
    } else {
      throw new Error(json.errors[0].message)
    }
  }
</script>

{#await fetchOrgTree(query)}
  <div class="m-auto">
    <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
  </div>
{:then}
  <ul class="dropdown-content menu rounded-box w-full">
    {#each orgTree as child}
      <Node {...child} />
    {/each}
  </ul>
{/await}
