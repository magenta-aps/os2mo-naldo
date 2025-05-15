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
  let resizeHandle: HTMLButtonElement

  // Function to update the height of the resize handle to match the drawer height
  const updateResizeHandleHeight = () => {
    if (drawerElement && resizeHandle) {
      resizeHandle.style.height = `${drawerElement.scrollHeight}px`
    }
  }

  // Mouse move handler
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
    // Set initial height for resize handle and observe size changes
    updateResizeHandleHeight()

    if (drawerElement) {
      new ResizeObserver(updateResizeHandleHeight).observe(drawerElement)
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
    class="drawer-side fixed h-[calc(100vh-4rem)] overflow-x-hidden overflow-y-auto"
    style="width: {`${$drawerWidth}px`}"
  >
    <label for="drawer" class="drawer-overlay" />
    <ul class="w-full h-fit">
      <div>
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
