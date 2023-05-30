<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitEngagementDetailDocument } from "./query.generated"
  import { gql } from "graphql-request"

  export let uuid: string
  export let tense: string

  gql`
    query OrgUnitEngagementDetail($uuid: [UUID!]) {
      org_units(uuids: $uuid) {
        objects {
          engagements {
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
            validity {
              from
              to
            }
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["Navn", "Stillingbetegnelse", "Engagementstype", "Dato"]}>
  {#await graphQLClient().request(OrgUnitEngagementDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const engagements = data.org_units[0].objects[0].engagements}
    {#each engagements as engagement}
      <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
        <a href="{base}/employee/{engagement.employee[0].uuid}">
          <td class="p-4">{engagement.employee[0].name}</td>
        </a>
        <td class="p-4">{engagement.job_function.name}</td>
        <td class="p-4">{engagement.engagement_type.name}</td>
        <ValidityTableCell validity={engagement.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
