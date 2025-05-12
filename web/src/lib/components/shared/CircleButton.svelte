<script lang="ts">
  import type { IconifyIcon } from "@iconify/types"
  import Icon from "@iconify/svelte"

  export let icon: IconifyIcon
  export let width: string = "20"
  export let height: string = "20"
  export let extraClasses: string = ""
</script>

<button
  type="button"
  class="btn btn-xs btn-circle btn-primary normal-case font-normal text-base text-base-100 {extraClasses}"
  on:click
>
  <Icon {icon} {width} {height} />
</button>
