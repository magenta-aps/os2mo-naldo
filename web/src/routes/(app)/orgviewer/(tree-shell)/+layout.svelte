<script lang="ts">
  import OrgViewerTree from "$lib/components/orgviewer/tree/OrgViewerTree.svelte"
  import { env } from "$lib/env"
  import { page } from "$app/stores"

  // `uuid` is the focused org unit (present on /tree and /orgunit, optional
  // on /person until an org unit context is known); `rootUuid` is always
  // optional, falling back to the deployment-wide default. Kept mounted
  // across tree/orgunit/person navigation so expand state isn't lost when
  // only the detail panel (the <slot/> below) changes.
  $: rootUuid = $page.params.rootUuid ?? env.PUBLIC_ORGVIEWER_ROOT_UUID
  $: focusedUuid = $page.params.uuid
</script>

<div class="flex gap-4 p-4">
  <nav
    class="max-h-[calc(100vh-6rem)] w-72 shrink-0 overflow-auto rounded-box border border-base-300 bg-base-100 p-3"
  >
    <OrgViewerTree {rootUuid} {focusedUuid} />
  </nav>
  <main class="min-w-0 flex-1">
    <slot />
  </main>
</div>
