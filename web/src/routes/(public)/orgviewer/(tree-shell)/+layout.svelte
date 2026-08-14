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

<div class="flex min-h-screen">
  <nav class="w-80 shrink-0 overflow-auto">
    <OrgViewerTree {rootUuid} {focusedUuid} />
  </nav>
  <main class="flex-1 overflow-auto">
    <slot />
  </main>
</div>
