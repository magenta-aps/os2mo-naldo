<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
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

  onMount(async () => {
    await initKeycloak()
  })
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={Favicon} />
  <title>OS2mo</title>
</svelte:head>

<div class="flex min-h-screen">
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <SearchBar />
      <!-- Page content here -->
      <Drawer>
        <slot />
      </Drawer>
    </div>
    <!-- Navbar -->
    <Navbar />
  </div>
</div>

<SuccessAlert />
<!-- TODO: Handle Errors on GraphQL reads better.. -->
<ErrorAlert />
<WarningAlert />
