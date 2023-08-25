<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
</script>

<div class="drawer lg:drawer-open">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col h-auto">
    <!-- Page content here -->
    {#if $isAuth}
      <slot />
    {:else}
      <div class="m-auto justify-center">
        <div
          class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary mb-6"
        />
        <span>Authenticating...</span>
      </div>
    {/if}
  </div>
  <div class="drawer-side">
    <label for="drawer" class="drawer-overlay" />
    <ul class="overflow-y-auto w-80 bg-base-100 min-h-screen border">
      <!-- Sidebar content here -->
      <div class="flex-none">
        <DrawerContent />
      </div>
    </ul>
  </div>
</div>
