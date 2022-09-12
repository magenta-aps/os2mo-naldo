<script lang="ts">
  import CreateOrg from "$lib/components/modals/create_org.svelte"
  import "$lib/global.css"
  import Navbar from "$lib/components/navbar.svelte"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"
  import { isAuth } from "$lib/stores/auth"
  import { initKeycloak } from "$lib/util/keycloak"

  let drawerToggled: boolean

  onMount(async () => {
    await initKeycloak()
  })
</script>

<Navbar />
<div class="drawer drawer-mobile">
  <input
    id="my-drawer-3"
    type="checkbox"
    class="drawer-toggle"
    bind:checked={drawerToggled}
  />
  <div class="drawer-content flex flex-col">
    <!-- Page content here -->
    {#if $isAuth}
      <slot />
    {:else}
      <div class="m-auto">
        <div
          class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary flex justify-center"
        />
        <p class="pt-6">Authenticating...</p>
      </div>
    {/if}
  </div>
  <div class="drawer-side">
    <label for="my-drawer-3" class="drawer-overlay" />
    <ul class="menu p-4 overflow-y-auto w-80 bg-base-100 border">
      <!-- Sidebar content here -->
      <div class="flex-none">
        <DrawerContent />
      </div>
    </ul>
  </div>
</div>
<CreateOrg />
