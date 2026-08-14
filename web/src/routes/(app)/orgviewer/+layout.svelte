<script lang="ts">
  import { env } from "$lib/env"

  // Auth (Keycloak login + PBAC-scoped GraphQL access) is already handled
  // by the parent (app) layout - this nested layout only adds a distinct
  // page title.
</script>

<svelte:head>
  <title>{env.PUBLIC_ORGVIEWER_TITLE}</title>
</svelte:head>

<slot />
