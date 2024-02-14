<script lang="ts">
  import { _ } from "svelte-i18n"
  import { formatDate } from "$lib/util/date"

  interface Validity {
    from?: any
    to?: any
  }

  export let validity: Validity
</script>

<td class="whitespace-nowrap px-4 py-2">
  <div>
    <span class="text-slate-600 font-normal inline-block min-w-[2.5rem]">Start</span>
    {#if validity.from}
      {formatDate(validity.from)}
    {/if}
  </div>
  <div>
    <span class="text-slate-600 font-normal inline-block min-w-[2.5rem]">Slut</span>
    {#if validity.to}
      {formatDate(validity.to)}
    {/if}
  </div>
</td>
