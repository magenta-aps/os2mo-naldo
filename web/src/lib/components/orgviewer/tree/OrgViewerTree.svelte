<script lang="ts">
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { fetchParentTree } from "$lib/http/parentTree"
  import { date } from "$lib/stores/date"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import Icon from "@iconify/svelte"
  import arrowBackRounded from "@iconify/icons-material-symbols/arrow-back-rounded"
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

  // NOTE: PUBLIC_ORGVIEWER_TREE_LAYOUT's "horizontal"/"hybrid" modes aren't
  // visually implemented - the legacy app's dedicated SCSS for those was
  // never ported. Only the vertical layout below is styled.
</script>

<div class="space-y-1">
  {#await request}
    <div role="status" class="animate-pulse space-y-2">
      <div class="h-8 rounded-sm bg-base-200" />
      <div class="ml-6 h-8 rounded-sm bg-base-200" />
      <div class="ml-6 h-8 rounded-sm bg-base-200" />
    </div>
    <span class="sr-only">{capital($_("loading"))}...</span>
  {:then result}
    {#if result}
      {#if result.root.parent}
        <a
          href={`${base}/orgviewer/tree/${rootUuid}/${result.root.parent.uuid}`}
          class="btn btn-outline btn-sm mb-2 rounded-sm font-normal normal-case"
        >
          <Icon icon={arrowBackRounded} width="16" height="16" />
          {capital($_("orgviewer.level_up"))}
        </a>
      {/if}
      <ul class="space-y-0.5">
        <OrgViewerNode {...result.root} {rootUuid} breadcrumbs={result.breadcrumbs} />
      </ul>
    {/if}
  {:catch error}
    <p role="alert" class="text-sm text-error">{capital($_("orgviewer.error_loading_tree"))}</p>
  {/await}
</div>
