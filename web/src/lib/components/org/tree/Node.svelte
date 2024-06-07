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
  export let child_count: number
  export let indent = 8
  export let uuid = ""
  export let breadcrumbs: string[] = []
  export let open = false
  export let fromDate: string
  export let orgUnitHierarchyUuid: string | undefined | null = undefined

  let loading = false

  gql`
    query OrgUnitChildren($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { parents: $uuid, from_date: $fromDate }) {
        objects {
          validities {
            name
            uuid
            child_count(filter: { from_date: $fromDate })
          }
        }
      }
    }

    query OrgUnitFilteredChildren(
      $uuid: [UUID!]
      $fromDate: DateTime
      $orgUnitHierarchies: [UUID!]
    ) {
      org_units(
        filter: {
          parents: $uuid
          from_date: $fromDate
          subtree: { from_date: $fromDate, hierarchy: { uuids: $orgUnitHierarchies } }
        }
      ) {
        objects {
          validities {
            name
            uuid
            child_count(
              filter: {
                subtree: {
                  from_date: $fromDate
                  hierarchy: { uuids: $orgUnitHierarchies }
                }
              }
            )
          }
        }
      }
    }
  `

  const fetchChildren = async (uuid: string) => {
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

      // Check if we already did this (re-opening the org)
      if (!children.some((child) => "children" in child)) {
        const res = await fetchChildren(uuid)

        // Overwrite with the new layer of children
        children = res.map((child) => child.validities[0])
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
  class="block p-0 m-0 w-full h-full hover:no-underline"
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
        <div class="w-5 h-5 loading loading-spinner" />
      {:else if child_count}
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
        <div class="w-5 h-5" />
      {/if}
      <p class="text-sm text-secondary break-words">
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
