<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { EmployeeDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { page } from "$app/stores"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
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
    }
  `
</script>

<DetailTable headers={["Navn", "Kaldenavn", "Anciennitet", "Dato", "", ""]}>
  {#await graphQLClient().request(EmployeeDocument, { uuid: uuid, fromDate: $date })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees.objects[0].objects[0]}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">
        {employee.name}
      </td>
      <td class="p-4">{employee.nickname}</td>
      <td class="p-4">{employee.seniority || ""}</td>
      <ValidityTableCell validity={employee.validity} />
      <td>
        <a aria-disabled href="{base}/employee/{uuid}/edit">
          <Icon type="pen" />
        </a>
      </td>
      <td>
        <a href="{base}/employee/{uuid}/terminate">
          <Icon type="xmark" size="30" />
        </a></td
      >
    </tr>
  {/await}
</DetailTable>
