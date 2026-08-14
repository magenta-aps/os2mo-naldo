<script lang="ts">
  import { env } from "$lib/env"
  import { initOrgviewerAuth } from "$lib/auth/orgviewerAuth"
  import { onMount } from "svelte"
  import "$lib/global.css"

  // Deliberately does not call initKeycloak() - orgviewer is a public,
  // unauthenticated viewer backed by a service-account token, not an
  // interactive login (see $lib/auth/orgviewerAuth.ts).
  onMount(async () => {
    await initOrgviewerAuth()
  })
</script>

<svelte:head>
  <title>{env.PUBLIC_ORGVIEWER_TITLE}</title>
</svelte:head>

<slot />
