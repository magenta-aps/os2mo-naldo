<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import { tenses } from "$lib/stores/tenses"
  import type { ComponentType, SvelteComponent } from "svelte"
  import { MOConfig } from "$lib/stores/config"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import AddressTable from "$lib/components/tables/AddressTable.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"
  import ItUserTable from "./ITUserTable.svelte"
  import RelatedUnitsTable from "./RelatedUnitsTable.svelte"
  import { env } from "$lib/env"

  export let headers: Header[]
  export let table: ComponentType<SvelteComponent>

  // Specific for admin interface
  export let facetUuid: string | undefined = undefined

  // Filter out all the tabs that are dependent on environment variables
  $: if ($MOConfig) {
    if ($MOConfig.confdb_show_level === "false") {
      headers = headers.filter(
        (header) => header.title !== capital($_("org_unit_level"))
      )
    }
    if ($MOConfig.confdb_show_time_planning === "false") {
      headers = headers.filter(
        (header) => header.title !== capital($_("time_planning"))
      )
    }

    if (
      $MOConfig.confdb_show_primary_engagement === "false" &&
      table == EngagementTable
    ) {
      headers = headers.filter((header) => header.title !== capital($_("primary")))
    }
    if (
      $MOConfig.confdb_show_primary_association === "false" &&
      table == AssociationTable
    ) {
      headers = headers.filter((header) => header.title !== capital($_("primary")))
    }
    if (
      !JSON.parse($MOConfig.confdb_association_dynamic_facets) &&
      table == AssociationTable
    ) {
      headers = headers.filter((header) => header.title !== capital($_("trade_union")))
    }
  }

  if (!env.PUBLIC_SHOW_EXTENSION_2 && table === EngagementTable) {
    headers = headers.filter(
      (header) => header.title !== capital($_("department_code"))
    )
  }

  if (!env.PUBLIC_SHOW_EXTENSION_1 && table === EngagementTable) {
    headers.splice(3, 1)
  }

  if (!env.PUBLIC_AUDITLOG && table !== RelatedUnitsTable) {
    // If we don't want to show Auditlog-button, remove one of the empty headers. Otherwise the table looks weird
    headers.pop()
  }

  if (!env.PUBLIC_SHOW_ITUSER_CONNECTIONS) {
    if (table === EngagementTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("ituser", { values: { n: 2 } }))
      )
    }
    if (table === AddressTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("ituser", { values: { n: 1 } }))
      )
    }
    if (table === ItUserTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("engagement", { values: { n: 1 } }))
      )
    }
  }
</script>

<DetailTable {headers}>
  {#if $tenses.future}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={15}
        >{capital($_("future"))}</th
      >
    </tr>
    <svelte:component this={table} tense="future" {facetUuid} />
  {/if}
  {#if $tenses.present}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={15}
        >{capital($_("present"))}</th
      ></tr
    >
    <svelte:component this={table} tense="present" {facetUuid} />
  {/if}
  {#if $tenses.past}
    <tr>
      <th class="px-4 py-3 text-left font-bold text-secondary bg-slate-200" colSpan={15}
        >{capital($_("past"))}</th
      >
    </tr>
    <svelte:component this={table} tense="past" {facetUuid} />
  {/if}
</DetailTable>
