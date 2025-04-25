<script lang="ts">
  import { _ } from "svelte-i18n"
  import type { IconifyIcon } from "@iconify/types"
  import Icon from "@iconify/svelte"

  export let type: "button" | "submit" = "submit"
  export let title: string | undefined = undefined
  export let size: "xs" | "sm" | "md" | "lg" | "xl" = "sm"
  export let outline: boolean = false
  export let onClick: (() => void) | undefined = undefined
  export let disabled: boolean = false
  export let href: string | undefined = undefined

  export let icon: IconifyIcon | undefined = undefined
  export let width: string = "25"
  export let height: string = "25"

  // Log a warning, since not setting `type="button"`, while doing an onClick might lead to weird bugs
  if (type === "submit" && onClick) {
    console.warn(
      "Button: onClick handler is set, but type is 'submit' — it might be ignored if the form handles submission."
    )
  }
</script>

{#if href}
  <a
    {href}
    class="btn btn-{size} btn-primary {outline
      ? 'btn-outline'
      : ''} rounded normal-case font-normal text-base-100 hover:no-underline"
  >
    {#if icon}
      <Icon {icon} {width} {height} />
    {/if}
    {#if title}
      {title}
    {/if}
  </a>
{:else}
  <button
    {type}
    class="btn btn-{size} btn-primary {outline
      ? 'btn-outline'
      : ''} rounded normal-case font-normal text-base-100"
    on:click={onClick}
    {disabled}
  >
    {#if icon}
      <Icon {icon} {width} {height} />
    {/if}
    {#if title}
      {title}
    {/if}
  </button>
{/if}
