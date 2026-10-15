<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import {
    formatDay,
    formatTimestamp,
    lastValidDay,
    lastValidMoment,
  } from "$lib/utils/date"

  interface Validity {
    from?: any
    to?: any
  }

  export let validity: Validity
</script>

<td class="text-sm px-4 py-2 whitespace-nowrap">
  <div>
    <span class="text-base-content/80 font-normal inline-block min-w-10"
      >{capital($_("date.start"))}</span
    >
    {#if validity.from}
      <span class="tooltip" data-tip={formatTimestamp(validity.from)}
        >{formatDay(validity.from.toPlainDate())}</span
      >
    {/if}
  </div>
  <div>
    <span class="text-base-content/80 font-normal inline-block min-w-10"
      >{capital($_("date.end"))}</span
    >
    {#if validity.to}
      <span class="tooltip" data-tip={formatTimestamp(lastValidMoment(validity.to))}
        >{formatDay(lastValidDay(validity.to))}</span
      >
    {/if}
  </div>
</td>
