<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import { tenses } from "$lib/stores/tenses"
  import type { ComponentType, SvelteComponent } from "svelte"

  export let headers: Header[]
  export let table: ComponentType<SvelteComponent>

  export let props: Record<string, unknown> = {}
</script>

<DetailTable {headers}>
  {#if $tenses.future}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("future"))}</th
      >
    </tr>
    <svelte:component this={table} tense="future" {...props} />
  {/if}
  {#if $tenses.present}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("present"))}</th
      ></tr
    >
    <svelte:component this={table} tense="present" {...props} />
  {/if}
  {#if $tenses.past}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("past"))}</th
      >
    </tr>
    <svelte:component this={table} tense="past" {...props} />
  {/if}
</DetailTable>
