<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import { onMount } from "svelte"

  let isResizing = false
  let currentSidebarWidth = 320
  const standardSidebarWidth = 320
  const largeScreenBreakpoint = 1024

  let drawerContentHeight = 0
  let resizeHandleHeight = 0
  let isLgScreen: boolean

  $: {
    if (typeof window !== "undefined") {
      const vhValue = window.innerHeight
      const calcValue = vhValue - 64

      resizeHandleHeight = Math.max(drawerContentHeight, calcValue)
      isLgScreen = window.innerWidth >= largeScreenBreakpoint

      if (isLgScreen) {
        currentSidebarWidth = standardSidebarWidth
      } else {
        const checkbox = <HTMLInputElement>document.getElementById("drawer")
        currentSidebarWidth = checkbox && checkbox.checked ? standardSidebarWidth : 0
      }
    }
  }

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDownOrUp)
    document.addEventListener("mouseup", handleMouseDownOrUp)
    window.addEventListener("resize", checkScreenSize)

    checkScreenSize()
  })

  function checkScreenSize() {
    const wasLgScreen = isLgScreen
    isLgScreen = window.innerWidth >= largeScreenBreakpoint

    if (wasLgScreen && !isLgScreen) {
      currentSidebarWidth = 0
      const checkbox = <HTMLInputElement>document.getElementById("drawer")
      if (checkbox) checkbox.checked = false // Luk drawer, hvis den er åben
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
        currentSidebarWidth = standardSidebarWidth
      } else {
        currentSidebarWidth = 0
      }
    }}
  />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

  <div class="drawer-content flex flex-col h-auto">
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
    style="width: {isLgScreen ? `${currentSidebarWidth}px` : '100%'};"
    class:open={!isLgScreen && currentSidebarWidth > 0}
  >
    <ul class="overflow-y-auto bg-base-100 min-h-[calc(100vh-4rem)] border">
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

<style>
  :global(body.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }

  @media (max-width: 1023px) {
    .drawer-side {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 0;
      overflow-x: hidden;
      z-index: 1000;
      transition: width 0.3s;
      background-color: transparent; /* Ingen baggrund som standard */
    }

    .drawer-side.open {
      width: 320px;
      background-color: rgba(0, 0, 0, 0.7);
    }

    /* Sørger for at indholdet af skuffen ikke lukker skuffen, når den klikkes */
    .drawer-side ul {
      background-color: white; /* Eller enhver anden baggrundsfarve for din skuffe */
      z-index: 2;
      position: relative;
    }
  }
</style>
