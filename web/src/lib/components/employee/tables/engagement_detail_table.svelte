<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { base } from "$app/paths"
  import { EmployeeEngagementDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"

  export let uuid: string
  export let tense: string

  gql`
    query EmployeeEngagement($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          engagements {
            uuid
            org_unit {
              name
              uuid
            }
            validity {
              to
              from
            }
            job_function {
              name
            }
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["Stillingsbetegnelse", "Enhed", "Dato"]}>
  {#await graphQLClient().request(EmployeeEngagementDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.engagements as engagement, i}
      <tr
        class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
      >
        <td class="p-4">
          {engagement.job_function.name}
        </td>

        <a href="{base}/organisation/{engagement.org_unit[0].uuid}">
          <td class="p-4">
            {engagement.org_unit[0].name}
          </td>
        </a>
        <ValidityTableCell validity={engagement.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
