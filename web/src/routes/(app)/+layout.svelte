<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { page } from "$app/stores"
  import "$lib/global.css"
  import SuccessAlert from "$lib/components/alerts/Success.svelte"
  import ErrorAlert from "$lib/components/alerts/Error.svelte"
  import WarningAlert from "$lib/components/alerts/Warning.svelte"
  import Navbar from "$lib/components/navbar/Navbar.svelte"
  import Favicon from "$lib/assets/favicon.png"
  import Drawer from "$lib/components/Drawer.svelte"
  import SearchBar from "$lib/components/navbar/SearchBar.svelte"
  import DrawerContent from "$lib/components/DrawerContent.svelte"
  import AdminNav from "$lib/components/admin/AdminNav.svelte"
  import { accessToken, isAdmin } from "$lib/stores/token"
  import type { LayoutData } from "./$types"

  export let data: LayoutData

  $: accessToken.set(data.accessToken)
  $: isAdmin.set(data.isAdmin)
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

<SuccessAlert />
<!-- TODO: Handle Errors on GraphQL reads better.. -->
<ErrorAlert />
<WarningAlert />
