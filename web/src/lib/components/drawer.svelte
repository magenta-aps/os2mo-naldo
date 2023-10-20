<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"
  import Icon from "./icon.svelte"
  import { sidebarWidth } from "$lib/stores/sidebar_width"

  const standardSidebarWidth = 314.95 // Standard width of the drawer (also minimum width for sidebar-resizing)
  const largeScreenBreakpoint = 1024 // standard lg breakpoint in Tailwind

  let drawerContentHeight = 0 // Not resizable by user; is set by drawerContent.
  let resizeHandleHeight = 0 // Not resizable by user; is set by drawerContent or screenHeight depending on which is larger.

  let isResizing = false
  let isLgScreen: boolean

  function checkScreenSize() {
    const wasLgScreen = isLgScreen
    isLgScreen = window.innerWidth >= largeScreenBreakpoint

    if (wasLgScreen && !isLgScreen) {
      $sidebarWidth = 0
      const checkbox = <HTMLInputElement>document.getElementById("drawer")
      if (checkbox) checkbox.checked = false // Close drawer if open
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isLgScreen) return
    if (
      isResizing &&
      e.clientX > standardSidebarWidth &&
      e.clientX < largeScreenBreakpoint
    ) {
      $sidebarWidth = e.clientX
    }
  }

  function handleMouseDownOrUp(e: MouseEvent) {
    if (!isLgScreen) {
      isResizing = false
      return
    }
    /* Disabling text-selection while resizing drawer*/
    if (e.type === "mousedown" && isResizing) {
      document.body.classList.add("no-select")
    } else if (e.type === "mouseup") {
      isResizing = false
      document.body.classList.remove("no-select")
    }
  }

  $: {
    if (typeof window !== "undefined") {
      const vhValue = window.innerHeight
      const calcValue = vhValue - 64 // Assuming 4rem is equal to 64px.

      resizeHandleHeight = Math.max(drawerContentHeight, calcValue)
      isLgScreen = window.innerWidth >= largeScreenBreakpoint

      if (isLgScreen) {
        $sidebarWidth = standardSidebarWidth
      } else {
        const checkbox = <HTMLInputElement>document.getElementById("drawer")
        $sidebarWidth = checkbox && checkbox.checked ? standardSidebarWidth : 0
      }
    }
  }

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDownOrUp) //Track mouse-button press
    document.addEventListener("mouseup", handleMouseDownOrUp) //Track mouse-button release
    window.addEventListener("resize", checkScreenSize)
    checkScreenSize()
  })
</script>

<div class="drawer lg:drawer-open h-[calc(100vh-4rem)]">
  <input
    id="drawer"
    type="checkbox"
    class="drawer-toggle"
    aria-label="Toggle sidebar"
    on:change={() => {
      const checkbox = document.getElementById("drawer")
      if (checkbox && "checked" in checkbox && checkbox.checked) {
        $sidebarWidth = standardSidebarWidth
      } else {
        $sidebarWidth = 0
      }
    }}
  />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

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
  <div
    class="drawer-side relative"
    style="width: {isLgScreen ? `${$sidebarWidth}px` : '100%'};"
    class:open={!isLgScreen && $sidebarWidth > 0}
  >
    <ul class="overflow-y-auto bg-base-100 min-h-[calc(100vh-4rem)] border">
      <!-- Sidebar content here -->
      <div bind:clientHeight={drawerContentHeight}>
        <DrawerContent />
      </div>
    </ul>
    <!-- Resize-handle -->
    <div
      role="button"
      class="absolute top-0 right-0 cursor-ew-resize w-1 flex items-center justify-center bg-gray-50 opacity-50 {isLgScreen
        ? ''
        : 'hidden'}"
      style="height: {resizeHandleHeight}px;"
      on:mousedown={() => (isResizing = true)}
      tabindex="0"
      aria-label="resize handle"
    >
      <!-- Temporary solution for the missing icon; it should be replaced with a better one once found -->
      <div class="flex flex-col">
        <Icon
          type="grid"
          class="transform rotate-90 opacity-25 scale-50 mb-[-0.688rem]"
        />
        <Icon type="grid" class="transform rotate-90 opacity-25 scale-50" />
      </div>
    </div>
  </div>
</div>

<style>
  /* Disabling text-selection while resizing drawer*/
  :global(body.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }

  @media (max-width: 1023px) {
    .drawer-side {
      position: fixed;
      top: 64px; /* Ensures that the navbar is visible when the screen is small, so the toggle button is accessible*/
    }

    .drawer-side.open {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
</style>
