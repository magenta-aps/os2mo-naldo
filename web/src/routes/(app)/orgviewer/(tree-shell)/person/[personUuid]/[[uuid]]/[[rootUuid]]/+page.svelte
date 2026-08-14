<script lang="ts">
  import { page } from "$app/stores"
  import PersonPanel from "$lib/components/orgviewer/person/PersonPanel.svelte"
  import { env } from "$lib/env"

  $: rootUuid = $page.params.rootUuid ?? env.PUBLIC_ORGVIEWER_ROOT_UUID
</script>

<PersonPanel personUuid={$page.params.personUuid} orgUuid={$page.params.uuid} {rootUuid} />
