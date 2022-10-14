<script lang="ts">
  import { formatDate } from "$lib/util/date"

  interface Validity {
    from: string
    to: string | null
  }

  export let validity: Validity
</script>

<td class="whitespace-nowrap px-4 py-2">
  <div>
    <span class="text-slate-600 font-normal inline-block min-w-[2.5rem]">Start</span>
    {formatDate(validity.from)}
  </div>
  <div>
    <span class="text-slate-600 font-normal inline-block min-w-[2.5rem]">Slut</span>
    {#if validity.to}
      {formatDate(validity.to)}
    {/if}
  </div>
</td>
