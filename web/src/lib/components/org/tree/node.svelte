<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import { OrgUnitChildrenDocument } from "./query.generated"
  import Icon from "$lib/components/icon.svelte"

  export let name = ""
  export let children: any[] = []
  export let indent = 8
  export let uuid = ""
  export let breadcrumbs: string[] = []
  export let open = false
  export let fromDate: string

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

  const expandToActiveChild = async () => {
    if (breadcrumbs && breadcrumbs[0] === uuid) {
      // Removes used UUID
      breadcrumbs = breadcrumbs.slice(1)
      await toggleOpen()

      // Exhausted breadcrumbs and the correct org should be visible
      if (breadcrumbs.length === 0) {
        const activeNode = document.getElementById("active")
        if (activeNode) {
          activeNode.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          })
        }
      }
    } else {
      // If UUID isn't a match, you're down a wrong branch
      breadcrumbs = []
    }
  }

  onMount(async () => {
    await expandToActiveChild()
  })
</script>

<a
  class=" m-0 p-0 block w-full h-full hover:no-underline"
  href={`${base}/organisation/${uuid}`}
>
  <li
    class="m-0 p-0 box-border rounded-md {$page.params.uuid === uuid
      ? 'bg-accent'
      : ''}"
  >
    <div
      class="py-2"
      style="padding-left: {indent}px"
      id={$page.params.uuid === uuid ? "active" : ""}
    >
      {#if loading}
        <div class="animate-spin rounded-full h-4 w-4 border-b-4 border-secondary" />
      {:else if children.length}
        {#if open}
          <button class="h-4 w-4" on:click|preventDefault={toggleOpen}>
            <Icon type="arrow" size="16" class="transform rotate-90 " />
          </button>
        {:else}
          <button class="h-4 w-4" on:click|preventDefault={toggleOpen}>
            <Icon type="arrow" size="16" />
          </button>
        {/if}
      {:else}
        <div class="h-4 w-4" />
      {/if}
      <p class="text-secondary break-words">
        {name}
      </p>
    </div>
  </li>
</a>

{#if open}
  {#each children as child}
    <svelte:self {...child} {breadcrumbs} {fromDate} indent={indent + 24} />
  {/each}
{/if}
