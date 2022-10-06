<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"
  import Icon from "./icon.svelte"

  let drawerToggled: boolean
  let sidebar: HTMLElement | null
  let dragging: boolean

  onMount(() => {
    sidebar = document.getElementById("sidebar")
  })
</script>

<div class="drawer drawer-mobile">
  <input
    id="my-drawer-3"
    type="checkbox"
    class="drawer-toggle"
    bind:checked={drawerToggled}
  />
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
  <div class="drawer-side w-80" id="sidebar">
    <label for="my-drawer-3" class="drawer-overlay" />
    <ul class="menu overflow-y-auto w-auto bg-base-100 mb-6 border">
      <div class="flex-none">
        <DrawerContent />
      </div>
    </ul>
    <button
      class="btn btn-accent btn-sm absolute z-50 bottom-0 p-2"
      style="width: inherit;"
      on:mousedown={() => {
        dragging = true
      }}
      on:mouseup={() => {
        dragging = false
      }}
      on:mouseleave={() => {
        dragging = false
      }}
      on:mousemove={(e) => {
        if (dragging) {
          sidebar.style.width = e.clientX * 2 + "px"
        }
      }}
    >
      <Icon type="resize" size="15" />
    </button>
  </div>
</div>
