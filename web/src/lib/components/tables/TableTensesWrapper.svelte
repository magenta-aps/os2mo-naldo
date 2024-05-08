<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import { tenses } from "$lib/stores/tenses"
  import type { ComponentType, SvelteComponent } from "svelte"
  import { MOConfig } from "$lib/stores/config"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"

  export let headers: Header[]
  export let table: ComponentType<SvelteComponent>

  // Filter out all the tabs that are dependent on environment variables
  if ($MOConfig && $MOConfig.confdb_show_level === "false") {
    headers = headers.filter((header) => header.title !== capital($_("org_unit_level")))
  }
  if ($MOConfig && $MOConfig.confdb_show_time_planning === "false") {
    headers = headers.filter((header) => header.title !== capital($_("time_planning")))
  }

  if (
    $MOConfig &&
    $MOConfig.confdb_show_primary_engagement === "false" &&
    table == EngagementTable
  ) {
    headers = headers.filter((header) => header.title !== capital($_("primary")))
  }
  if (
    $MOConfig &&
    $MOConfig.confdb_show_primary_association === "false" &&
    table == AssociationTable
  ) {
    headers = headers.filter((header) => header.title !== capital($_("primary")))
  }
  if (
    $MOConfig &&
    !JSON.parse($MOConfig.confdb_association_dynamic_facets) &&
    table == AssociationTable
  ) {
    headers = headers.filter((header) => header.title !== capital($_("trade_union")))
  }
</script>

<DetailTable {headers}>
  {#if $tenses.future}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >{capital($_("future"))}</th
      >
    </tr>
    <svelte:component this={table} tense="future" />
  {/if}
  {#if $tenses.present}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >{capital($_("present"))}</th
      ></tr
    >
    <svelte:component this={table} tense="present" />
  {/if}
  {#if $tenses.past}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={10}
        >{capital($_("past"))}</th
      >
    </tr>
    <svelte:component this={table} tense="past" />
  {/if}
</DetailTable>
