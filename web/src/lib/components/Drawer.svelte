<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/DrawerContent.svelte"
  import { defaultDrawerWidth, drawerWidth } from "$lib/stores/drawer_width"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import dragIndicator from "@iconify/icons-material-symbols/drag-indicator"

  let screenSize: number
  let isResizing = false

  onMount(() => {
    // Ensures that the resize stops no matter where in the window the user releases the mouse
    // If it is only done in the HTML part, it can be difficult for the user to 'release' the resize
    window.addEventListener("mouseup", () => (isResizing = false))
    window.addEventListener("mousemove", (e) => {
      if (!isResizing) return
      const newWidth = Math.max(e.clientX, defaultDrawerWidth)

      // Max width of 1000px
      if (newWidth < 1000) {
        $drawerWidth = newWidth
      }
    })
  })

  // Keeps track of when the screen goes between mobile and desktop view
  $: isLargeScreen = screenSize >= 1280
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="drawer xl:drawer-open">
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
    class="drawer-side fixed h-screen xl:h-[calc(100vh-4rem)] overflow-x-hidden"
    style="width: {isLargeScreen ? `${$drawerWidth}px` : '100%'}"
  >
    <label for="drawer" class="drawer-overlay" />
    <ul class="bg-base-100 w-1/2 xl:w-full h-screen xl:h-fit">
      <div>
        <DrawerContent />
      </div>
    </ul>
    {#if isLargeScreen}
      <!-- Only show resize button in desktop view -->
      <!-- TODO: Fix resize button, should be clickable on whole y-axis. -->
      <button
        class="absolute top-[50%] right-1 cursor-ew-resize w-1 flex items-center justify-center"
        on:mousedown={() => {
          isResizing = true
        }}
        tabindex="0"
      >
        <div class="flex flex-col">
          <Icon icon={dragIndicator} width="20" height="20" />
        </div>
      </button>
    {/if}
  </div>
</div>
