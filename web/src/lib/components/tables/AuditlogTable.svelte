<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { AuditlogDocument, type AuditlogQuery } from "./query.generated"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { onMount } from "svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { formatDateTime } from "$lib/utils/date"

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
          actor_object {
            __typename
            display_name
            uuid
          }
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
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as auditlog, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        <!-- TODO: Add link for employee, when actor_objects can be differentiated by person/integration -->
        {auditlog.actor_object.display_name}
      </td>

      <td class="text-sm p-4">{auditlog.registration_id}</td>
      <td class="text-sm p-4">{auditlog.note}</td>
      <td class="text-sm p-4">{formatDateTime(auditlog.start)}</td>
      <td class="text-sm p-4">{formatDateTime(auditlog.end)}</td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
