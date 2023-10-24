<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"
  import Icon from "./icon.svelte"
  import { defaultDrawerWidth, drawerWidth } from "$lib/stores/drawer_width"

  const largeScreenBreakpoint = 1024 // standard lg breakpoint i Tailwind
  let drawerHeight = 0 // Not resizable by user; is set by screenHeight.
  let isResizing: boolean = false
  let isLgScreen: boolean = false

  const updateScreenSize = () => {
    isLgScreen = window.innerWidth >= largeScreenBreakpoint
    drawerHeight = isLgScreen ? window.innerHeight - 64 : window.innerHeight
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isLgScreen || !isResizing) return
    const newWidth = Math.max(e.clientX, defaultDrawerWidth)
    if (newWidth < largeScreenBreakpoint) {
      $drawerWidth = newWidth
    }
  }

  //This function ensures that the resize stops no matter where in the window the user releases the mouse
  //If it is only done in the HTML part, it can be difficult for the user to 'release' the resize
  const handleMouseUp = () => {
    if (!isLgScreen || !isResizing) return
    isResizing = false
  }

  onMount(() => {
    updateScreenSize()
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp) //Track mouse-button release
    window.addEventListener("resize", updateScreenSize) //Checks if the resize handle should be hidden
  })
</script>

<div class="drawer lg:drawer-open min-h-[calc(100vh-4rem)]">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

  <div class="drawer-content flex flex-col border-l">
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
  <!-- Sidebar content here -->
  <div
    class="drawer-side fixed lg:relative"
    style="width: {isLgScreen ? `${$drawerWidth}px` : '100%'};height: {drawerHeight}px"
    class:open={!isLgScreen && $drawerWidth > 0}
  >
    <label for="drawer" class="drawer-overlay" />
    <ul class="overflow-y-auto bg-base-100 min-h-[calc(100vh-4rem)]">
      <!-- Drawer indhold her -->
      <div>
        <DrawerContent />
      </div>
    </ul>
    <!-- Resize-handle -->
    <div
      role="button"
      class="absolute top-0 right-0 cursor-ew-resize w-1 flex items-center justify-center {isLgScreen
        ? ''
        : 'hidden'}"
      style="height: {drawerHeight}px;"
      on:mousedown={(e) => {
        if (isLgScreen) {
          isResizing = true
          /* Disabling text-selection while resizing drawer*/
          document.body.classList.add("no-select")
        }
      }}
      on:mouseup={(e) => {
        if (isLgScreen) {
          isResizing = false
          document.body.classList.remove("no-select")
        }
      }}
      tabindex="0"
      aria-label="resize handle"
    >
      <div class="flex flex-col">
        <Icon type="draghandle" />
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
</style>
