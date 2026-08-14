<script lang="ts">
  import Icon from "@iconify/svelte"
  import type { IconifyIcon } from "@iconify/types"

  export let icon: IconifyIcon | undefined = undefined
  export let label: string | undefined = undefined
</script>

<div class="flex items-start gap-2 py-1.5">
  {#if icon}
    <Icon {icon} width="18" height="18" class="mt-0.5 shrink-0 text-primary" />
  {/if}
  <div class="min-w-0">
    {#if label}
      <div class="text-xs font-medium tracking-wide text-base-content/60 uppercase">
        {label}
      </div>
    {/if}
    <div class="text-sm">
      <slot />
    </div>
  </div>
</div>
