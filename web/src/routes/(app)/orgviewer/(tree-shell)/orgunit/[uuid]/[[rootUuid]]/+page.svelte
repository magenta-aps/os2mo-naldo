<script lang="ts">
  import OrganisationPanel from "$lib/components/orgviewer/OrganisationPanel.svelte"
  import { env } from "$lib/env"
  import { page } from "$app/stores"

  $: rootUuid = $page.params.rootUuid ?? env.PUBLIC_ORGVIEWER_ROOT_UUID
</script>

<OrganisationPanel uuid={$page.params.uuid} {rootUuid} />
