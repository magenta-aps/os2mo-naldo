<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { OrgChildrenDocument } from "./query.generated"
  import Icon from "$lib/components/icon.svelte"

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
      query OrgChildren($uuid: [UUID!], $fromDate: DateTime) {
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
    const data = await graphQLClient().request(OrgChildrenDocument, {
      uuid: uuid,
      fromDate: fromDate,
    })
    if (data.org_units) {
      return data.org_units.objects[0].objects[0].children
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

<li style="padding-left: {indent}px">
  <div
    role="button"
    tabindex="0"
    class="flex items-center"
    on:click={() => {
      selectedOrg.name = name
      selectedOrg.uuid = uuid
    }}
    on:keydown={(event) => {
      if (event.key === "Enter" || event.key === "Space") {
        selectedOrg.name = name
        selectedOrg.uuid = uuid
        event.preventDefault()
      }
    }}
  >
    {#if loading}
      <div class="animate-spin rounded-full h-5 w-5 border-b-4 border-primary" />
    {:else}
      <div
        class="flex items-center justify-center w-5 h-5 mr-2 mb-3"
        role="button"
        tabindex="0"
        on:click={toggleOpen}
        on:keydown={(event) => {
          if (event.key === "Enter" || event.key === "Space") {
            toggleOpen()
            event.preventDefault()
          }
        }}
      >
        {#if children && children.length > 0}
          <Icon type="arrow" class={open ? "transform rotate-90" : ""} />
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
