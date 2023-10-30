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
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          objects {
            name
            uuid
            nickname
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

<DetailTable
  headers={[
    { title: "Navn" },
    { title: "Kaldenavn" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]}
>
  {#await graphQLClient().request( EmployeeDocument, { uuid: uuid, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const filteredObjects = data.employees.objects[0].objects.filter((obj) =>
      tenseFilter(obj, tense)
    )}
    {#each filteredObjects as employee}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">
          {employee.name}
        </td>
        <td class="p-4">{employee.nickname}</td>
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
    {/each}
  {/await}
</DetailTable>
