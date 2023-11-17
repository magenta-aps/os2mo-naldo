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
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = [
    isOrg ? { title: "Navn" } : { title: "Enhed" },
    { title: "Rolletype" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]

  gql`
    query EmployeeAndOrgRoles(
      $employee_uuid: [UUID!]
      $org_uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      roles(
        filter: {
          employees: $employee_uuid
          org_units: $org_uuid
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
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
    }
  `
</script>

<DetailTable {headers}>
  {#await graphQLClient().request( EmployeeAndOrgRolesDocument, { org_uuid: org_unit, employee_uuid: employee, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.roles.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as role}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          {#if isOrg}
            <a href="{base}/employee/{role.employee[0].uuid}">
              <td class="p-4">{role.employee[0].name}</td>
            </a>
          {:else}
            <a href="{base}/organisation/{role.org_unit[0].uuid}">
              <td class="p-4">
                {role.org_unit[0].name}
              </td>
            </a>
          {/if}
          <td class="p-4">{role.role_type.name}</td>
          <ValidityTableCell validity={role.validity} />
          <td>
            <a
              href="{base}/{$page.route.id?.split('/')[1]}/{uuid}/edit/role/{role.uuid}"
            >
              <Icon type="pen" />
            </a>
          </td>
          <td>
            <a
              href="{base}/{$page.route.id?.split(
                '/'
              )[1]}/{uuid}/terminate/role/{role.uuid}"
            >
              <Icon type="xmark" size="30" />
            </a>
          </td>
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
