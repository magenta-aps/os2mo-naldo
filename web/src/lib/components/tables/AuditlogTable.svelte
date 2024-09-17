<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { AuditlogDocument, type AuditlogQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import { formatDate } from "$lib/util/date"

  type Auditlog = AuditlogQuery["auditlog"]["objects"]
  let data: Auditlog

  const uuid = $page.params.uuid

  gql`
    query Auditlog($uuid: [UUID!]) {
      auditlog(filter: { uuids: $uuid }) {
        objects {
          actor
          model
          id
          time
        }
      }
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(AuditlogDocument, {
      uuid: uuid,
    })
    const auditlog: Auditlog = []

    // Filters and flattens the data
    for (const outer of res.auditlog.objects) {
      auditlog.push(outer)
    }
    data = auditlog
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as auditlog}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4">{auditlog.actor}</td>
      <td class="text-sm p-4">{auditlog.id}</td>
      <td class="text-sm p-4">{auditlog.model}</td>
      <td class="text-sm p-4">{formatDate(auditlog.time)}</td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
