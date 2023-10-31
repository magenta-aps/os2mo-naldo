<script lang="ts">
  import { isAuth } from "$lib/stores/auth"
  import DrawerContent from "$lib/components/drawer_content.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { defaultDrawerWidth, drawerWidth } from "$lib/stores/drawer_width"
  import { onMount } from "svelte"

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
  $: isLargeScreen = screenSize >= 1024
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="drawer lg:drawer-open min-h-[calc(100vh-4rem)]">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <label for="drawer" class="drawer-overlay cursor-pointer" aria-hidden="true" />

  <div class="drawer-content flex flex-col border-l overflow-hidden">
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
    class="drawer-side fixed lg:h-[calc(100vh-4rem)]"
    style="width: {isLargeScreen ? `${$drawerWidth}px` : '100%'}"
  >
    <label for="drawer" class="drawer-overlay" />
    <ul class="overflow-y-auto bg-base-100 min-h-full lg:min-h-[calc(100vh-4rem)]">
      <div>
        <DrawerContent />
      </div>
    </ul>
    {#if isLargeScreen}
      <!-- Only show resize button in desktop view -->
      <button
        class="absolute top-0 right-0 cursor-ew-resize w-1 flex items-center justify-center h-screen"
        on:mousedown={() => {
          isResizing = true
        }}
        tabindex="0"
      >
        <div class="flex flex-col">
          <Icon type="draghandle" size="16" />
        </div>
      </button>
    {/if}
  </div>
</div>
