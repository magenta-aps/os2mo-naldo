<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeDetailDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"

  export let uuid: string
  export let tense: string

  gql`
    query EmployeeDetail($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          name
          nickname
          seniority
          validity {
            from
            to
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["Navn", "Kaldenavn", "Anciennitet", "Dato"]}>
  {#await graphQLClient().request(EmployeeDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">
        {employee.name}
      </td>
      <td class="p-4">{employee.nickname}</td>
      <td class="p-4">{employee.seniority || ""}</td>
      <ValidityTableCell validity={employee.validity} />
    </tr>
  {/await}
</DetailTable>
