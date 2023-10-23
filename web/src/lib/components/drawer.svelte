<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"
  import Icon from "./icon.svelte"
  import { defaultDrawerWidth, drawerWidth } from "$lib/stores/drawer_width"

  const largeScreenBreakpoint = 1024 // standard lg breakpoint in Tailwind
  let drawerContentHeight = 0 // Not resizable by user; is set by drawerContent.
  let resizeHandleHeight = 0 // Not resizable by user; is set by drawerContent or screenHeight depending on which is larger.

  let isResizing = false
  let isLgScreen: boolean

  const checkScreenSize = () => {
    isLgScreen = window.innerWidth >= largeScreenBreakpoint
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isLgScreen) return
    if (
      isResizing &&
      e.clientX > defaultDrawerWidth &&
      e.clientX < largeScreenBreakpoint
    ) {
      $drawerWidth = e.clientX
    }
  }

  const handleMouseDownOrUp = (e: MouseEvent) => {
    if (!isLgScreen) {
      isResizing = false
      return
    }
    // Disabling text-selection while resizing drawer
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
    }
  }

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDownOrUp) //Track mouse-button press
    document.addEventListener("mouseup", handleMouseDownOrUp) //Track mouse-button release
    window.addEventListener("resize", checkScreenSize) //Checks if the resize handle should be hidden
    checkScreenSize()
  })
</script>

<div class="drawer lg:drawer-open h-[calc(100vh-4rem)]">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

  <div class="drawer-content flex flex-col h-6 min-h-[calc(100vh-4rem)]">
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
    class="drawer-side fixed lg:relative"
    style="width: {isLgScreen
      ? `${$drawerWidth}px`
      : '100%'}; min-h-[calc(100vh-4rem)]; height: auto"
    class:open={!isLgScreen && $drawerWidth > 0}
  >
    <label for="drawer" class="drawer-overlay" />
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
</style>
