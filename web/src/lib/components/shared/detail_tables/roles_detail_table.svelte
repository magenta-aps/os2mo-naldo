<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EmployeeAndOrgRolesDocument } from "./query.generated"
  import Icon from "$lib/components/icon.svelte"
  import { date } from "$lib/stores/date"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = isOrg
    ? ["Navn", "Rolletype", "Dato"]
    : ["Enhed", "Rolletype", "Dato", "", ""]

  gql`
    query EmployeeAndOrgRoles(
      $employee_uuid: [UUID!]
      $org_uuid: [UUID!]
      $fromDate: DateTime
    ) {
      roles(employees: $employee_uuid, org_units: $org_uuid, from_date: $fromDate) {
        objects {
          uuid
          role_type {
            name
          }
          validity {
            from
            to
          }
          employee {
            name
            uuid
          }
          org_unit {
            name
            uuid
          }
        }
      }
    }
  `
</script>

<DetailTable {headers}>
  {#await graphQLClient().request( EmployeeAndOrgRolesDocument, { org_uuid: org_unit, employee_uuid: employee, fromDate: $date } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.roles as role}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        {#if isOrg}
          <a href="{base}/employee/{role.objects[0].employee[0].uuid}">
            <td class="p-4">{role.objects[0].employee[0].name}</td>
          </a>
          <td class="p-4">{role.objects[0].role_type.name}</td>
          <ValidityTableCell validity={role.objects[0].validity} />
        {:else}
          <a href="{base}/organisation/{role.objects[0].org_unit[0].uuid}">
            <td class="p-4">
              {role.objects[0].org_unit[0].name}
            </td>
          </a>
          <td class="p-4">{role.objects[0].role_type.name}</td>
          <ValidityTableCell validity={role.objects[0].validity} />
          <td>
            <a
              aria-disabled
              href="{base}/employee/{uuid}/edit/role/{role.objects[0].uuid}"
            >
              <Icon type="pen" />
            </a>
          </td>
          <td>
            <a href="{base}/employee/{uuid}/terminate/role/{role.objects[0].uuid}">
              <Icon type="xmark" size="30" />
            </a></td
          >
        {/if}
      </tr>
    {/each}
  {/await}
</DetailTable>
