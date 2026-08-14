<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { env } from "$lib/env"
  import { graphQLClient } from "$lib/http/client"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import Icon from "@iconify/svelte"
  import centerFocusStrongRounded from "@iconify/icons-material-symbols/center-focus-strong-rounded"
  import keyboardArrowDownRounded from "@iconify/icons-material-symbols/keyboard-arrow-down-rounded"
  import { onMount } from "svelte"
  import {
    computePersonCounts,
    filterHiddenOrgUnits,
    sortSiblings,
    type OrgViewerUnit,
  } from "./orgViewerTree"
  import { OrgViewerUnitChildrenDocument } from "./queries"

  export let uuid: string
  export let name: string
  export let has_children: boolean
  export let child_count: number
  export let associations: OrgViewerUnit["associations"] = []
  export let engagements: OrgViewerUnit["engagements"] = []
  export let rootUuid: string
  // Ancestor uuids between the focused (URL) org unit and this node,
  // nearest-ancestor-first - see $lib/http/parentTree.ts. Ported from
  // Node.svelte's identical breadcrumbs/expandToActiveChild pattern.
  export let breadcrumbs: string[] = []
  export let indent = 8

  let open = false
  let loading = false
  let children: OrgViewerUnit[] | undefined = undefined

  const fetchChildren = async (): Promise<OrgViewerUnit[]> => {
    const res = await graphQLClient().request(OrgViewerUnitChildrenDocument, {
      uuid: [uuid],
    })
    const raw = res.org_units.objects.map((o) => o.validities[0])
    return filterHiddenOrgUnits(raw, {
      hideUuids: env.PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_UUIDS,
      hideNameSubstrings: env.PUBLIC_ORGVIEWER_HIDE_ORG_UNITS_BY_NAME,
      hideLevelUuids: env.PUBLIC_ORGVIEWER_HIDE_ORG_UNIT_LEVELS,
    })
  }

  const toggleOpen = async () => {
    if (!open) {
      loading = true
      if (children === undefined) {
        children = await fetchChildren()
      }
      loading = false
    }
    open = !open
  }

  const expandToActiveChild = async () => {
    if (breadcrumbs[0] === uuid) {
      breadcrumbs = breadcrumbs.slice(1)
      await toggleOpen()

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
      breadcrumbs = []
    }
  }

  onMount(async () => {
    await expandToActiveChild()
  })

  $: personCounts = computePersonCounts(
    { associations, engagements },
    env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION,
    env.PUBLIC_ORGVIEWER_REMOVE_ENGAGEMENT_TYPE_UUID
  )

  $: sortedChildren = children
    ? sortSiblings(children, env.PUBLIC_ORGVIEWER_SORT_SPECIFIC_UNITS_TO_BOTTOM)
    : []
</script>

<li id={`node-${uuid}`} class="m-0 p-0 rounded-md {$page.params.uuid === uuid ? 'bg-accent' : ''}">
  <div
    class="py-2 flex items-center gap-1"
    style="padding-left: {indent}px"
    id={$page.params.uuid === uuid ? "active" : ""}
  >
    {#if loading}
      <div class="w-5 h-5 loading loading-spinner" />
    {:else if has_children || child_count > 0}
      <button
        type="button"
        on:click|preventDefault={toggleOpen}
        aria-expanded={open}
        title={open
          ? capital($_("orgviewer.hide_children", { values: { n: child_count } }))
          : capital($_("orgviewer.show_children", { values: { n: child_count } }))}
      >
        <Icon icon={keyboardArrowDownRounded} width="20" height="20" rotate={open ? 0 : 3} />
      </button>
    {:else}
      <div class="w-5 h-5" />
    {/if}

    <a
      class="flex-1 hover:no-underline"
      href={`${base}/orgviewer/orgunit/${uuid}/${rootUuid}`}
      title={name}
    >
      <p class="text-sm text-base-content wrap-break-word">{name}</p>
      {#if !env.PUBLIC_ORGVIEWER_REMOVE_PERSON_COUNT}
        <p class="text-xs opacity-60">
          {#if personCounts.engagements !== undefined}
            {personCounts.engagements}
            {$_("orgviewer.employees_count", { values: { n: personCounts.engagements } })}
          {/if}
          {#if personCounts.associations !== undefined}
            {personCounts.associations}
            {$_("orgviewer.associated_count", { values: { n: personCounts.associations } })}
          {/if}
        </p>
      {/if}
    </a>

    {#if !env.PUBLIC_ORGVIEWER_REMOVE_CHILDREN_COUNT && has_children}
      <span class="text-xs opacity-60">{child_count}</span>
    {/if}

    {#if uuid !== rootUuid}
      <a
        href={`${base}/orgviewer/tree/${uuid}/${uuid}`}
        title={capital($_("orgviewer.focus_unit", { values: { name } }))}
      >
        <Icon icon={centerFocusStrongRounded} width="16" height="16" />
      </a>
    {/if}
  </div>
</li>

{#if open}
  {#each sortedChildren as child (child.uuid)}
    <svelte:self {...child} {rootUuid} {breadcrumbs} indent={indent + 24} />
  {/each}
{/if}
