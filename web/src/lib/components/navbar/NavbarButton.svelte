<script lang="ts">
  import { page } from "$app/stores"
  import type { IconifyIcon } from "@iconify/types"
  import Icon from "@iconify/svelte"

  export let title: string | undefined = undefined
  export let href: string | undefined = undefined
  export let drawerId: string | undefined = undefined
  export let tooltip: string | undefined = undefined

  export let icon: IconifyIcon | string
  export let width: string = "20"
  export let height: string = "20"
  export let rotateWhenOpen: boolean = false

  export let external: boolean = false
  export let iconClass: string = "my-1.5 inline-block size-4"

  $: tag = href ? "a" : drawerId ? "label" : "button"

  // We only keep the "conflict-prone" attributes in this object
  $: attrs = {
    type: tag === "button" ? "button" : undefined,
    for: drawerId,
    target: external ? "_blank" : undefined,
  } as any

  /* === LOGIC FIX === */
  /* 1. Is this a "special" tooltip (like versions) that differs from the title? */
  $: isImportant = tooltip && tooltip !== title

  /* 2. Class Logic:
      - Always: 'tooltip' base class if important, or drawer-closed tooltip if not.
      - Closed: 'is-drawer-close:tooltip-right' (Points side).
      - Open:   'tooltip-bottom' (Points down, so it doesn't get cut off).
  */
  $: tooltipStateClass = isImportant
    ? "tooltip tooltip-bottom is-drawer-close:tooltip-right"
    : "is-drawer-close:tooltip is-drawer-close:tooltip-right"
</script>

<svelte:element
  this={tag}
  {...attrs}
  {href}
  role={href ? undefined : "button"}
  tabindex={tag === "label" ? 0 : undefined}
  on:click
  on:keydown
  class="
{tooltipStateClass}
    is-drawer-close:tooltip is-drawer-close:tooltip-right
    hover:no-underline hover:bg-accent hover:text-base-content transition-all
    {href && $page.url.pathname === href
    ? 'bg-accent text-base-content'
    : 'text-secondary-content'}
  "
  data-tip={tooltip || title}
>
  <div class="transition-all w-4 {rotateWhenOpen ? 'is-drawer-open:rotate-180' : ''}">
    <Icon class={iconClass} {icon} {width} {height} />
  </div>
  {#if title}
    <span class="is-drawer-close:hidden truncate font-medium">
      {title}
    </span>
  {/if}
</svelte:element>
