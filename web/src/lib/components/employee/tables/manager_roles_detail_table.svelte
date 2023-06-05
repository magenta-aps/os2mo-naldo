<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeManagerRolesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"

  export let uuid: string
  export let tense: string

  gql`
    query EmployeeManagerRoles($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          manager_roles {
            org_unit {
              name
              uuid
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

<!-- TODO: Needs Lederansvar, Ledertype, Lederniveau -->
<DetailTable headers={["Enhed", "Dato"]}>
  {#await graphQLClient().request(EmployeeManagerRolesDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}

    {#each employee.manager_roles as manager_role, i}
      <tr
        class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
      >
        <a href="{base}/organisation/{manager_role.org_unit[0].uuid}">
          <td class="p-4">
            {manager_role.org_unit[0].name}
          </td>
        </a>
        <ValidityTableCell validity={manager_role.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
