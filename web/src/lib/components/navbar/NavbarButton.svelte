<script lang="ts">
  import { _ } from "svelte-i18n"
  import type { IconifyIcon } from "@iconify/types"
  import Icon from "@iconify/svelte"

  export let title: string | undefined = undefined
  export let href: string | undefined = undefined

  export let icon: IconifyIcon | string
  export let width: string = "20"
  export let height: string = "20"
  export let open: boolean = false

  export let external: boolean = false
</script>

<li class="flex">
  <a
    {href}
    class="btn btn-secondary flex-nowrap text-start text-white hover:no-underline hover:bg-accent hover:text-secondary
      {open ? 'justify-start' : 'btn-square'}"
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
  >
    <Icon {icon} {width} {height} />
    {#if open}
      <span class="font-bold nowrap">{title}</span>
    {/if}
  </a>
</li>
