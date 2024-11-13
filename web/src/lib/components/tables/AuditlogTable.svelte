<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { AuditlogDocument, type AuditlogQuery } from "./query.generated"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { formatDateTime } from "$lib/util/date"

  type Auditlog = AuditlogQuery["registrations"]["objects"]
  let data: Auditlog

  gql`
    query Auditlog($uuid: [UUID!]) {
      registrations(filter: { uuids: $uuid }) {
        objects {
          uuid
          registration_id
          note
          model
          start
          end
          actor
        }
      }
    }
  `
  // Set default sortKey (normally validity.from)
  $sortKey = "start"

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(AuditlogDocument, {
      uuid: $page.params.uuid,
    })
    const auditlog: Auditlog = []

    // Filters and flattens the data
    for (const outer of res.registrations.objects) {
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
      <td class="text-sm p-4">{formatDateTime(auditlog.start)}</td>
      <td class="text-sm p-4">{auditlog.actor}</td>
      <td class="text-sm p-4">{auditlog.registration_id}</td>
      <td class="text-sm p-4">{auditlog.note}</td>
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
