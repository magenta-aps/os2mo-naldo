<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/Success.svelte"
  import ErrorAlert from "$lib/components/alerts/Error.svelte"
  import WarningAlert from "$lib/components/alerts/Warning.svelte"
  import Navbar from "$lib/components/navbar/Navbar.svelte"
  import { onMount } from "svelte"
  import { initKeycloak } from "$lib/auth/keycloak"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/Drawer.svelte"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import DrawerContent from "$lib/components/DrawerContent.svelte"
  import AdminNav from "$lib/components/admin/AdminNav.svelte"
  import { env } from "$lib/env"

  onMount(async () => {
    await initKeycloak()
  })
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title
    >{env.PUBLIC_ENVIRONMENT !== "prod"
      ? `[${env.PUBLIC_ENVIRONMENT.toUpperCase()}] `
      : ""}OS2mo</title
  >
</svelte:head>

<div class="flex min-h-screen">
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <SearchBar />
      <!-- Page content here -->
      <Drawer>
        <svelte:fragment slot="sidebar">
          {#if $page.route.id?.includes("/admin")}
            <AdminNav />
          {:else}
            <DrawerContent />
          {/if}
        </svelte:fragment>
        <slot />
      </Drawer>
    </div>
    <!-- Navbar -->
    <Navbar />
  </div>
</div>

{#if env.PUBLIC_ENVIRONMENT !== "prod"}
  <div
    class="bg-warning text-warning-content text-center text-sm font-semibold py-1 fixed bottom-0 left-0 right-0"
  >
    {$_(`environment_warning_${env.PUBLIC_ENVIRONMENT}`)}
  </div>
{/if}

<SuccessAlert />
<!-- TODO: Handle Errors on GraphQL reads better.. -->
<ErrorAlert />
<WarningAlert />
