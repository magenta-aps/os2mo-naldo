<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { tenses } from "$lib/stores/tenses"
  import type { ComponentType, SvelteComponent } from "svelte"

  export let headers: Header[]
  export let table: ComponentType<SvelteComponent>
  export let onlyPresent = false
</script>

<DetailTable {headers}>
  {#if !onlyPresent}
    {#if $tenses.future}
      <tr>
        <th
          class="px-4 py-3 text-left font-bold text-secondary bg-slate-200"
          colSpan={10}>{capital($_("future"))}</th
        >
      </tr>
      <svelte:component this={table} tense="future" />
    {/if}
  {/if}
  {#if $tenses.present}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >{capital($_("present"))}</th
      ></tr
    >
    <svelte:component this={table} tense="present" />
  {/if}
  {#if !onlyPresent}
    {#if $tenses.past}
      <tr>
        <th
          class="px-4 py-3 text-left font-bold text-secondary bg-slate-200"
          colSpan={10}>{capital($_("past"))}</th
        >
      </tr>
      <svelte:component this={table} tense="past" />
    {/if}
  {/if}
</DetailTable>
