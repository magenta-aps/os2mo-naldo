<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"

  export let uuid: string
  export let tense: string

  gql`
    query EmployeeLeaves($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          leaves {
            validity {
              from
              to
            }
            leave_type {
              name
            }
            engagement {
              org_unit {
                name
              }
              job_function {
                name
              }
            }
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["Orlovstype", "Engagement", "Dato"]}>
  {#await graphQLClient().request(EmployeeLeavesDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.leaves as leave, i}
      <tr
        class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
      >
        <td class="p-4">
          {leave.leave_type.name}
        </td>
        <td class="p-4">
          {#if leave.engagement}
            {leave.engagement.job_function.name}, {leave.engagement.org_unit[0].name}
          {/if}
        </td>
        <ValidityTableCell validity={leave.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
