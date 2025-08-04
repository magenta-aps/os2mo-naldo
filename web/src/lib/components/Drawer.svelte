<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/DrawerContent.svelte"
  import { defaultDrawerWidth, drawerWidth } from "$lib/stores/drawerWidth"
  import { onMount, afterUpdate } from "svelte"
  import Icon from "@iconify/svelte"
  import dragIndicator from "@iconify/icons-material-symbols/drag-indicator"

  let screenSize: number
  let isResizing = false
  let drawerStartX = 0
  let drawerElement: HTMLDivElement
  let drawerContentWrapper: HTMLDivElement
  let resizeHandle: HTMLButtonElement

  // Dynamically adjusts the resize handle's height.
  // - Ensures the handle is always tall enough to span the full drawer.
  // - If the drawer's content is taller than the visible viewport, the handle matches that height.
  // - Otherwise, it uses the drawer's visible height.
  const updateResizeHandleHeight = () => {
    if (drawerElement && drawerContentWrapper && resizeHandle) {
      const visibleHeight = drawerElement.offsetHeight
      const contentHeight = drawerContentWrapper.offsetHeight
      const handleHeight = Math.max(visibleHeight, contentHeight)
      resizeHandle.style.height = `${handleHeight}px`
    }
  }

  // Called continuously during mouse movement while resizing.
  // Calculates the offset and updates the drawer width in real-time,
  // keeping a minimum width of 240px.
  const moveComponent = (event: MouseEvent) => {
    if (!isResizing) return
    const offsetX = event.clientX - drawerStartX
    const newWidth = Math.max(240, $drawerWidth + offsetX) // Keep the width within a reasonable range
    $drawerWidth = newWidth
    drawerStartX = event.clientX
  }

  // Mouse up handler
  const stop = () => {
    isResizing = false
  }

  // Mouse down handler to start resizing
  const startResizing = (event: MouseEvent) => {
    isResizing = true
    drawerStartX = event.clientX
  }

  onMount(() => {
    // Initial resize handle height setup
    updateResizeHandleHeight()

    // Automatically re-run height calculation when drawer content grows/shrinks
    if (drawerContentWrapper) {
      const observer = new ResizeObserver(updateResizeHandleHeight)
      observer.observe(drawerContentWrapper)
    }
  })
</script>

<svelte:window
  bind:innerWidth={screenSize}
  on:mousemove={moveComponent}
  on:mouseup={stop}
/>

<div class="drawer drawer-open">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

  <div class="drawer-content flex flex-col border-l">
    {#if $isAuth}
      <slot />
    {:else}
      <div class="m-auto justify-center">
        <span
          class="loading loading-spinner text-secondary h-32 w-32 border-primary mb-6"
        />
        <p>{capital($_("authenticating"))}...</p>
      </div>
    {/if}
  </div>

  <div
    bind:this={drawerElement}
    class="drawer-side relative overflow-x-hidden overflow-y-auto"
    style="height: calc(100vh - 4rem);width: {`${$drawerWidth}px`}"
  >
    <label for="drawer" class="drawer-overlay" />
    <ul class="bg-base-100 w-full h-fit">
      <div bind:this={drawerContentWrapper}>
        <DrawerContent />
      </div>
    </ul>

    <!-- Resizable handle dynamically adjusting to drawer height -->
    <button
      type="button"
      bind:this={resizeHandle}
      class="absolute top-0 right-0 w-4 cursor-ew-resize bg-transparent {isResizing
        ? 'select-none'
        : 'select-auto'}"
      on:mousedown={startResizing}
    />
  </div>
</div>
