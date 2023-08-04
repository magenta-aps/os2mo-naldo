<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { page } from "$app/stores"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"

  export let tense: string

  gql`
    query Employee($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          name
          uuid
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

<DetailTable headers={["Navn", "Kaldenavn", "Anciennitet", "Dato", "", ""]}>
  {#await graphQLClient().request(EmployeeDocument, { uuid: $page.params.uuid })}
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
        <td>
          <a aria-disabled href="{base}/employee/{$page.params.uuid}/edit/employee/{employee.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/employee/{$page.params.uuid}/terminate/employee/{employee.uuid}">
            <Icon type="xmark" size="30" />
          </a></td
        >
    </tr>
  {/await}
</DetailTable>
