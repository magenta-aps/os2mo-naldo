<script lang="ts">
  import { page } from "$app/stores"
  import PersonPanel from "$lib/components/orgviewer/person/PersonPanel.svelte"
  import { env } from "$lib/env"
  import type { PageData } from "./$types"

  export let data: PageData

  $: rootUuid = $page.params.rootUuid ?? env.PUBLIC_ORGVIEWER_ROOT_UUID
</script>

<PersonPanel person={data.person} orgUuid={$page.params.uuid} {rootUuid} />
