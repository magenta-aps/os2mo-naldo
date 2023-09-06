<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { OrgChildrenDocument } from "./query.generated"

  export let selectedOrg: any
  export let name = ""
  export let children: any[] = []
  export let indent = 0
  export let uuid = ""
  export let fromDate: string

  let open = false
  let loading = false

  const fetchChildren = async () => {
    gql`
      query OrgChildren($uuid: [UUID!], $from_date: DateTime!) {
        org_units(uuids: $uuid, from_date: $fromDate) {
          objects {
            children {
              name
              uuid
            }
          }
        }
      }
    `
    const data = await graphQLClient().request(OrgChildrenDocument, {
      uuid: uuid,
      from_date: fromDate,
    })
    if (data.org_units) {
      return data.org_units[0].objects[0].children
    }
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true
      for (let child of children) {
        if (!child.children) {
          child.children = await fetchChildren()
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
  <div>
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else if children.length}
      <p on:click={toggleOpen}>{open ? "⌄" : "➤"}</p>
    {/if}
    {name}
  </div>
</li>

{#if open}
  {#each children as child}
    <svelte:self {...child} indent={indent + 24} {fromDate} bind:selectedOrg />
  {/each}
{/if}
