<script lang="ts">
  import Icon from "@iconify/svelte"
  import infoOutlineRounded from "@iconify/icons-material-symbols/info-outline-rounded"
  import { createFloatingActions } from "svelte-floating-ui"
  import { flip, offset, shift } from "svelte-floating-ui/dom"

  export let info: string | undefined = undefined
  // The icon's accessible name; `info` itself describes it via aria-describedby
  export let label: string
  // Must be unique in the document, for aria-describedby
  export let id: string

  let tooltip: HTMLDivElement | undefined

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: "fixed",
    placement: "bottom",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  })

  // `togglePopover(force)` rather than showPopover/hidePopover, which throw
  // when the popover is already in the requested state
  const toggle = (open: boolean) => tooltip?.togglePopover(open)
</script>

{#if info}
  <button
    type="button"
    class="text-base-content/60 cursor-pointer"
    aria-label={label}
    aria-describedby={id}
    use:floatingRef
    on:mouseenter={() => toggle(true)}
    on:mouseleave={() => toggle(false)}
    on:focus={() => toggle(true)}
    on:blur={() => toggle(false)}
  >
    <Icon icon={infoOutlineRounded} width="15" height="15" />
  </button>
  <!-- The top layer keeps this clear of any ancestor's overflow or stacking
       context. `[popover]` UA styles centre it, hence the inset/margin resets.
       Colours match daisyUI's `.tooltip`. -->
  <div
    bind:this={tooltip}
    {id}
    popover="manual"
    role="tooltip"
    use:floatingContent
    class="m-0 inset-auto whitespace-pre rounded-sm border-0 bg-neutral px-2
      py-1 text-sm leading-tight text-neutral-content shadow-sm"
  >
    {info}
  </div>
{/if}
