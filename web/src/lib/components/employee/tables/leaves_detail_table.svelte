<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { page } from "$app/stores"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query EmployeeLeaves($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          leaves {
            uuid
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

<DetailTable headers={["Orlovstype", "Engagement", "Dato", "", ""]}>
  {#await graphQLClient().request(EmployeeLeavesDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.leaves as leave}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">
          {leave.leave_type.name}
        </td>
        <td class="p-4">
          {#if leave.engagement}
            {leave.engagement.job_function.name}, {leave.engagement.org_unit[0].name}
          {/if}
        </td>
        <ValidityTableCell validity={leave.validity} />
        <td>
          <a aria-disabled href="{base}/organisation/{uuid}/edit/leave/{leave.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/organisation/{uuid}/terminate/leave/{leave.uuid}">
            <Icon type="xmark" size="30" />
          </a></td
        >
      </tr>
    {/each}
  {/await}
</DetailTable>
