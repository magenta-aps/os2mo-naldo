<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onDestroy, onMount } from "svelte"

  let isResizing = false
  let currentSidebarWidth = 320
  const standardSidebarWidth = 320
  const largeScreenBreakpoint = 1024 // standard lg breakpoint in Tailwind
  let drawerContentHeight = 0
  let resizeHandleHeight = 0

  let isLgScreen: boolean

  $: {
    if (typeof window !== "undefined") {
      resizeHandleHeight = drawerContentHeight // The handle height follows the height of DrawerContent.
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
    document.addEventListener("mousedown", handleMouseDownOrUp)
    document.addEventListener("mouseup", handleMouseDownOrUp)
    window.addEventListener("resize", checkScreenSize) // Check screen size on window resize

    checkScreenSize()

    onDestroy(() => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mousedown", handleMouseDownOrUp)
      document.removeEventListener("mouseup", handleMouseDownOrUp)
      window.removeEventListener("resize", checkScreenSize)
    })
  })

  function checkScreenSize() {
    isLgScreen = window.innerWidth >= largeScreenBreakpoint
  }

  function handleMouseMove(e: MouseEvent) {
    if (
      isResizing &&
      e.clientX > standardSidebarWidth &&
      e.clientX < largeScreenBreakpoint
    ) {
      currentSidebarWidth = e.clientX
    }
  }

  function handleMouseDownOrUp(e: MouseEvent) {
    if (e.type === "mousedown" && isResizing) {
      document.body.classList.add("no-select")
    } else if (e.type === "mouseup") {
      isResizing = false
      document.body.classList.remove("no-select")
    }
  }
</script>

<div class="drawer lg:drawer-open h-[calc(100vh-4rem)]">
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
  <div
    class="drawer-side relative"
    style="width: {currentSidebarWidth}px; min-height: calc(100vh-4rem);"
  >
    <ul class="overflow-y-auto bg-base-100 border">
      <!-- Sidebar content here -->
      <div bind:clientHeight={drawerContentHeight}>
        <DrawerContent />
      </div>
    </ul>
    <div
      role="button"
      class="drawer-side-resize-handle absolute top-0 right-0 cursor-ew-resize w-3 flex items-center justify-center {isLgScreen
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
</style>
