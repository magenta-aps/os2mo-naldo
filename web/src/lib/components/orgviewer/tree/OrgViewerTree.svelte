<script lang="ts">
  import { base } from "$app/paths"
  import { env } from "$lib/env"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import { date } from "$lib/stores/date"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import type { OrgViewerUnit } from "./orgViewerTree"
  import OrgViewerNode from "./OrgViewerNode.svelte"
  import { OrgViewerUnitByUuidDocument } from "./queries"

  export let rootUuid: string
  export let focusedUuid: string | undefined = undefined

  type RootResult = { root: OrgViewerUnit; breadcrumbs: string[] } | null

  // Ancestor uuids strictly between `rootUuid` and `focusedUuid` (exclusive
  // of both), nearest-to-root-first, so OrgViewerNode can auto-expand down
  // to the focused unit on load - see its expandToActiveChild. If
  // `focusedUuid` isn't actually a descendant of `rootUuid`, there's nothing
  // to expand towards.
  const resolveBreadcrumbs = async (uuid: string, focused?: string): Promise<string[]> => {
    if (!focused || focused === uuid) return []

    const ancestors = await fetchParentTree(focused, $date)
    const rootIndex = ancestors.findIndex((a) => a.uuid === uuid)
    if (rootIndex === -1) return []

    return ancestors
      .slice(0, rootIndex)
      .map((a) => a.uuid)
      .reverse()
  }

  const fetchRoot = async (uuid: string, focused?: string): Promise<RootResult> => {
    const res = await graphQLClient().request(OrgViewerUnitByUuidDocument, {
      uuid: [uuid],
    })
    const root = res.org_units.objects[0]?.validities[0]
    if (!root) return null

    return { root, breadcrumbs: await resolveBreadcrumbs(uuid, focused) }
  }

  let request: Promise<RootResult>
  let cachedKey = ""

  $: {
    const key = `${rootUuid}:${focusedUuid ?? ""}`
    if (key !== cachedKey) {
      cachedKey = key
      request = fetchRoot(rootUuid, focusedUuid)
    }
  }

  $: layoutClass =
    env.PUBLIC_ORGVIEWER_TREE_LAYOUT === "horizontal" ||
    env.PUBLIC_ORGVIEWER_TREE_LAYOUT === "hybrid"
      ? "oc-layout-horizontal"
      : "oc-layout-vertical"
</script>

<div class={layoutClass}>
  {#await request}
    <div role="status" class="max-w-sm animate-pulse">
      <div class="mb-2.5 h-10 rounded-sm bg-base-100 max-w-4 dark:bg-accent" />
      <span class="sr-only">{capital($_("loading"))}...</span>
    </div>
  {:then result}
    {#if result}
      {#if result.root.parent}
        <nav>
          <a href={`${base}/orgviewer/tree/${rootUuid}/${result.root.parent.uuid}`}>
            {capital($_("orgviewer.level_up"))}
          </a>
        </nav>
      {/if}
      <ul>
        <OrgViewerNode {...result.root} {rootUuid} breadcrumbs={result.breadcrumbs} />
      </ul>
    {/if}
  {:catch error}
    <p role="alert" class="text-error">{capital($_("orgviewer.error_loading_tree"))}</p>
  {/await}
</div>
