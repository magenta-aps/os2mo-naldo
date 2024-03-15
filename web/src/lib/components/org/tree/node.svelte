<script lang="ts">
  import { _ } from "svelte-i18n"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"
  import {
    OrgUnitChildrenDocument,
    OrgUnitFilteredChildrenDocument,
    type OrgUnitChildrenQuery,
    type OrgUnitFilteredChildrenQuery,
  } from "./query.generated"
  import Icon from "@iconify/svelte"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"

  export let name = ""
  export let children: any[] = []
  export let indent = 8
  export let uuid = ""
  export let breadcrumbs: string[] = []
  export let open = false
  export let fromDate: string
  export let orgUnitHierarchyUuid: string | undefined | null

  let loading = false

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            children {
              name
              uuid
            }
          }
        }
      }
    }

    query OrgUnitFilteredChildren(
      $uuid: [UUID!]
      $fromDate: DateTime
      $orgUnitHierarchies: [UUID!]
    ) {
      org_units(filter: { uuids: $uuid }) {
        objects {
          objects {
            uuid
            children(
              filter: {
                subtree: {
                  from_date: $fromDate
                  hierarchy: { uuids: $orgUnitHierarchies }
                }
              }
            ) {
              name
              uuid
            }
          }
        }
      }
    }
  `

  const fetchChildren = async (uuid: string[]) => {
    let res: OrgUnitChildrenQuery | OrgUnitFilteredChildrenQuery

    if (orgUnitHierarchyUuid) {
      res = await graphQLClient().request(OrgUnitFilteredChildrenDocument, {
        uuid: uuid,
        fromDate: fromDate,
        orgUnitHierarchies: orgUnitHierarchyUuid,
      })
    } else {
      res = await graphQLClient().request(OrgUnitChildrenDocument, {
        uuid: uuid,
        fromDate: fromDate,
      })
    }

    return res.org_units.objects
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true

      // Check if the children are cached
      const childrenToFetch = children.filter((child) => !child.children)

      // Skip if cached
      if (childrenToFetch.length) {
        const fetchedChildren = await fetchChildren(
          childrenToFetch.map((child) => child.uuid)
        )

        // Adds the next layer of children
        for (const child of children) {
          child.children = fetchedChildren.shift()?.objects[0].children
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
  class="m-0 p-0 block w-full h-full hover:no-underline"
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
        <div class="loading loading-spinner h-5 w-5" />
      {:else if children.length}
        {#if open}
          <button on:click|preventDefault={toggleOpen}>
            <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={0} />
          </button>
        {:else}
          <button on:click|preventDefault={toggleOpen}>
            <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={3} />
          </button>
        {/if}
      {:else}
        <div class="h-5 w-5" />
      {/if}
      <p class="text-secondary break-words">
        {name}
      </p>
    </div>
  </li>
</a>

{#if open}
  {#each children.sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) ) as child}
    <svelte:self
      {...child}
      {orgUnitHierarchyUuid}
      {breadcrumbs}
      {fromDate}
      indent={indent + 24}
    />
  {/each}
{/if}
