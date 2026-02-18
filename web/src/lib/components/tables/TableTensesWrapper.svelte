<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import { tenses } from "$lib/stores/tenses"
  import type { ComponentType, SvelteComponent } from "svelte"
  import AssociationTable from "$lib/components/tables/AssociationTable.svelte"
  import AddressTable from "$lib/components/tables/AddressTable.svelte"
  import ClassTable from "$lib/components/tables/ClassTable.svelte"
  import EngagementTable from "$lib/components/tables/EngagementTable.svelte"
  import ItUserTable from "$lib/components/tables/ITUserTable.svelte"
  import OrgITUserTable from "$lib/components/tables/OrgITUserTable.svelte"
  import OrgUnitTable from "$lib/components/tables/OrgUnitTable.svelte"
  import RelatedUnitsTable from "$lib/components/tables/RelatedUnitsTable.svelte"

  export let headers: Header[]
  export let table: ComponentType<SvelteComponent>

  // Specific for admin interface
  export let facetUuid: string | undefined = undefined

  $: {
    if (!env.PUBLIC_SHOW_TIME_PLANNING && table === OrgUnitTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("time_planning"))
      )
    }

    if (!env.PUBLIC_SHOW_ORG_UNIT_LEVEL && table === OrgUnitTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("org_unit_level"))
      )
    }

    if (!env.PUBLIC_SHOW_PRIMARY_ENGAGEMENT && table == EngagementTable) {
      headers = headers.filter((header) => header.title !== capital($_("primary")))
    }

    if (!env.PUBLIC_SHOW_PRIMARY_ASSOCIATION && table == AssociationTable) {
      headers = headers.filter((header) => header.title !== capital($_("primary")))
    }

    if (!env.PUBLIC_ENABLE_CONFEDERATIONS && table == AssociationTable) {
      headers = headers.filter((header) => header.title !== capital($_("trade_union")))
    }

    if (!env.PUBLIC_SHOW_EXTENSION_1 && table === EngagementTable) {
      headers.splice(3, 1)
    }

    if (!env.PUBLIC_SHOW_EXTENSION_4 && table === EngagementTable) {
      headers = headers.filter(
        (header) => header.title !== capital($_("department_code"))
      )
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
      if (table === ItUserTable || table === OrgITUserTable) {
        headers = headers.filter(
          (header) => header.title !== capital($_("engagement", { values: { n: 2 } }))
        )
      }
    }
    if (!env.PUBLIC_ENABLE_CLASS_TERMINATION && table === ClassTable) {
      headers.pop()
    }
  }
</script>

<DetailTable {headers}>
  {#if $tenses.future}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("future"))}</th
      >
    </tr>
    <svelte:component this={table} tense="future" {facetUuid} />
  {/if}
  {#if $tenses.present}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("present"))}</th
      ></tr
    >
    <svelte:component this={table} tense="present" {facetUuid} />
  {/if}
  {#if $tenses.past}
    <tr>
      <th
        class="px-4 py-3 text-left font-bold text-base-content bg-base-200"
        colSpan={15}>{capital($_("past"))}</th
      >
    </tr>
    <svelte:component this={table} tense="past" {facetUuid} />
  {/if}
</DetailTable>
