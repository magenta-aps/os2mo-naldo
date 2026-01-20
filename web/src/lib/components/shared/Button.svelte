<script lang="ts">
  import { _ } from "svelte-i18n"
  import type { IconifyIcon } from "@iconify/types"
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"

  export let type: "button" | "submit" = "submit"
  export let title: string | undefined = undefined
  export let outline: boolean = false
  export let disabled: boolean = false
  export let href: string | undefined = undefined

  export let icon: IconifyIcon | undefined = undefined
  export let width: string = "25"
  export let height: string = "25"

  export let spinner: boolean = false
  export let extraClasses: string = ""
  export let info: string | undefined = undefined
</script>

{#if href}
  <a
    {href}
    class="btn btn-sm btn-primary {outline
      ? 'btn-outline'
      : 'text-base-100'} rounded normal-case font-normal hover:no-underline {extraClasses}"
  >
    {#if icon}
      <Icon {icon} {width} {height} />
    {/if}
    {#if title}
      {title}
    {/if}
  </a>
{:else}
  <div
    class={info ? "relative inline-block tooltip tooltip-bottom" : ""}
    data-tip={info && disabled ? info : undefined}
  >
    <button
      {type}
      class="btn btn-sm btn-primary {outline
        ? 'btn-outline'
        : 'text-base-100'} rounded normal-case font-normal {extraClasses}"
      on:click
      {disabled}
    >
      {#if icon}
        <Icon {icon} {width} {height} />
      {/if}
      {#if title}
        {title}
      {/if}
      {#if spinner}<span class="loading loading-spinner" />{/if}
      {#if info && disabled}
        <Icon icon={infoOutlineRounded} color="red" width="15" height="15" />
      {/if}
    </button>
  </div>
{/if}
