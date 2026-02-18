<script lang="ts">
  import Icon from "@iconify/svelte"

  /* Icons */
  import wbSunnyOutlineRounded from "@iconify/icons-material-symbols/wb-sunny-outline-rounded"
  import darkModeOutlineRounded from "@iconify/icons-material-symbols/dark-mode-outline-rounded"

  /* Matches your NavbarButton icon style exactly */
  const iconClass = "my-1.5 inline-block size-4"
  export let title: string | undefined = undefined
</script>

<label
  class="flex items-center is-drawer-close:tooltip is-drawer-close:tooltip-right hover:no-underline hover:bg-accent hover:text-base-content transition-all text-secondary-content"
  data-tip={title}
>
  <div class="swap swap-rotate transition-all w-4">
    <input type="checkbox" class="theme-controller" value="dark" />

    <div class="swap-off">
      <Icon icon={wbSunnyOutlineRounded} class={iconClass} width="20" height="20" />
    </div>

    <div class="swap-on">
      <Icon icon={darkModeOutlineRounded} class={iconClass} width="20" height="20" />
    </div>
  </div>

  <span class="is-drawer-close:hidden truncate font-medium">
    {title}
  </span>
</label>
