<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeRolesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { page } from "$app/stores"

  export let tense: string

  gql`
    query EmployeeRoles($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          roles {
            uuid
            role_type {
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
          }
        }
      }
    }
  `
</script>

<DetailTable headers={["Rolletype", "Enhed", "Dato", "", ""]}>
  {#await graphQLClient().request(EmployeeRolesDocument, { uuid: $page.params.uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.roles as role}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">
          {role.role_type.name}
        </td>

        <a href="{base}/organisation/{role.org_unit[0].uuid}">
          <td class="p-4">
            {role.org_unit[0].name}
          </td>
        </a>
        <ValidityTableCell validity={role.validity} />
        <td>
          <a aria-disabled href="{base}/employee/{$page.params.uuid}/edit/roles/{role.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/employee/{$page.params.uuid}/terminate/roles/{role.uuid}">
            <Icon type="xmark" size="30" />
          </a></td
        >
      </tr>
    {/each}
  {/await}
</DetailTable>
