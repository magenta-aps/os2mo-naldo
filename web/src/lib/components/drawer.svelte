<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onDestroy, onMount } from "svelte"

  let isResizing = false
  let currentSidebarWidth = 320
  const standardSidebarWidth = 320
  const largeScreenBreakpoint = 1024

  let drawerContentHeight = 0 // Not resizable by user; is set by drawerContent
  let resizeHandleHeight = 0 // Not resizable by user; is set by drawerContent or screenHeight.

  let isLgScreen: boolean

  $: {
    if (typeof window !== "undefined") {
      const vhValue = window.innerHeight
      const calcValue = vhValue - 64 // Assuming 4rem is equal to 64px.

      resizeHandleHeight = Math.max(drawerContentHeight, calcValue)

      isLgScreen = window.innerWidth >= largeScreenBreakpoint

      if (isLgScreen) {
        if (currentSidebarWidth === 0) {
          currentSidebarWidth = standardSidebarWidth
        }
      } else {
        currentSidebarWidth = 0
      }
    }
  }

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDownOrUp) //Tracks mouse-button press
    document.addEventListener("mouseup", handleMouseDownOrUp) //Tracks mouse-button press
    window.addEventListener("resize", checkScreenSize)

    checkScreenSize()
  })

  function checkScreenSize() {
    const wasLgScreen = isLgScreen
    isLgScreen = window.innerWidth >= largeScreenBreakpoint

    if (wasLgScreen && !isLgScreen) {
      currentSidebarWidth = 0
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isLgScreen) return

    if (
      isResizing &&
      e.clientX > standardSidebarWidth &&
      e.clientX < largeScreenBreakpoint
    ) {
      currentSidebarWidth = e.clientX
    }
  }

  function handleMouseDownOrUp(e: MouseEvent) {
    if (!isLgScreen) {
      isResizing = false
      return
    }

    if (e.type === "mousedown" && isResizing) {
      document.body.classList.add("no-select")
    } else if (e.type === "mouseup") {
      isResizing = false
      document.body.classList.remove("no-select")
    }
  }

  /* onDestroy(() => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mousedown", handleMouseDownOrUp)
    document.removeEventListener("mouseup", handleMouseDownOrUp)
    window.removeEventListener("resize", checkScreenSize)
}) */
</script>

<div class="drawer lg:drawer-open h-[calc(100vh-4rem)]">
  <input
    id="drawer"
    type="checkbox"
    class="drawer-toggle"
    aria-label="Toggle sidebar"
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
  <div class="drawer-side relative" style="width: {currentSidebarWidth}px; h-min;">
    <ul class="overflow-y-auto bg-base-100 min-h-[calc(100vh-4rem)] border">
      <!-- Sidebar content here -->
      <div bind:clientHeight={drawerContentHeight}>
        <DrawerContent />
      </div>
    </ul>
    <div
      role="button"
      class="drawer-side-resize-handle absolute top-0 right-0 cursor-ew-resize w-3 flex items-center justify-center bg-red-500 {isLgScreen
        ? ''
        : 'hidden'}"
      style="height: {resizeHandleHeight}px;"
      on:mousedown={() => (isResizing = true)}
      tabindex="0"
      aria-label="resize handle"
    />
  </div>
</div>

<!-- Disable text selection while resizing div. -->
<style>
  :global(body.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }

  @media (max-width: 1023px) {
    .drawer-side-resize-handle {
      pointer-events: none;
    }
  }
</style>
