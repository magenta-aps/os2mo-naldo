<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { OrgUnitChildrenDocument } from "$lib/components/org/select_tree/query.generated"
  import Arrow from "../../forms/shared/arrow.svelte"

  export let selectedOrg: any
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string

  let open = false
  let loading = false

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            children {
              name
              uuid
            }
          }
        }
      }
    }
  `

  const fetchChildren = async (uuid: string) => {
    const res = await graphQLClient().request(OrgUnitChildrenDocument, {
      uuid: uuid,
      fromDate: fromDate,
    })
    return res.org_units?.objects[0].objects[0].children
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true
      for (let child of children) {
        if (!child.children) {
          child.children = await fetchChildren(child.uuid)
        }
      }
      loading = false
    }
    open = !open
  }
</script>

<li
  style="padding-left: {indent}px"
  on:click={() => {
    selectedOrg.name = name
    selectedOrg.uuid = uuid
  }}
>
  <div class="flex items-center">
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <!-- Placeholder for arrows even if no children are present, gives a better visuel experience -->
      <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        on:click={toggleOpen}
      >
        {#if children && children.length > 0}
          {#if open}
            <Arrow class="transform rotate-90" />
          {:else}
            <Arrow />
          {/if}
        {/if}
      </div>
    {/if}
    <span class="mr-2">{name}</span>
  </div>
</li>
{#if open}
  {#each children as child}
    <svelte:self {...child} indent={indent + 24} {fromDate} bind:selectedOrg />
  {/each}
{/if}
