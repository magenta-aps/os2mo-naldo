<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EngagementsDocument } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = isOrg
    ? ["Navn", "Stillingbetegnelse", "Engagementstype", "Primær", "Dato"]
    : ["Enhed", "Stillingbetegnelse", "Engagementstype", "Primær", "Dato", "", ""]

  // Bør vi ikke tilføje noget tid til de her queries?
  gql`
    query Engagements(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      engagements(
        filter: {
          employees: $employee
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            employee {
              uuid
              name
            }
            job_function {
              name
            }
            engagement_type {
              name
            }
            org_unit {
              name
              uuid
            }
            validity {
              from
              to
            }
            primary {
              name
            }
          }
        }
      }
    }
  `
</script>

<DetailTable {headers}>
  {#await graphQLClient().request( EngagementsDocument, { org_unit: org_unit, employee: employee, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.engagements.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as engagement}
        <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
          {#if isOrg}
            <a href="{base}/employee/{engagement.employee[0].uuid}">
              <td class="p-4">{engagement.employee[0].name}</td>
            </a>
            <td class="p-4">{engagement.job_function.name}</td>
            <td class="p-4">{engagement.engagement_type.name}</td>
            <td class="p-4">{engagement.primary ? engagement.primary.name : ""}</td>
            <ValidityTableCell validity={engagement.validity} />
          {:else}
            <a href="{base}/organisation/{engagement.org_unit[0].uuid}">
              <td class="p-4">{engagement.org_unit[0].name}</td>
            </a>
            <td class="p-4">{engagement.job_function.name}</td>
            <td class="p-4">{engagement.engagement_type.name}</td>
            <td class="p-4">{engagement.primary ? engagement.primary.name : ""}</td>
            <ValidityTableCell validity={engagement.validity} />
            <td>
              <a href="{base}/employee/{uuid}/edit/engagement/{engagement.uuid}">
                <Icon type="pen" />
              </a>
            </td>
            <td>
              <a href="{base}/employee/{uuid}/terminate/engagement/{engagement.uuid}">
                <Icon type="xmark" size="30" />
              </a>
            </td>
          {/if}
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
