<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { ManagersDocument } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = isOrg
    ? ["Navn", "Lederansvar", "Ledertype", "Lederniveau", "Dato", "", ""]
    : ["Enhed", "Lederansvar", "Ledertype", "Lederniveau", "Dato", "", ""]

  gql`
    query Managers(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      managers(
        filter: {
          employees: $employee
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            employee {
              uuid
              name
            }
            org_unit {
              name
              uuid
            }
            manager_level {
              name
            }
            manager_type {
              name
            }
            responsibilities {
              name
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

<DetailTable {headers}>
  {#await graphQLClient().request( ManagersDocument, { org_unit: org_unit, employee: employee, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.managers.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as manager}
        <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
          {#if isOrg}
            <a
              href="{base}/employee/{manager.employee ? manager.employee[0].uuid : ''}"
            >
              <td class="p-4">{manager.employee ? manager.employee[0].name : ""}</td>
            </a>
            <td class="p-4">
              <ul>
                {#each manager.responsibilities as responsibility}
                  <li>
                    • {responsibility.name}
                  </li>
                {/each}
              </ul>
            </td>
            <td class="p-4">{manager.manager_type.name}</td>
            <td class="p-4">{manager.manager_level.name}</td>
            <ValidityTableCell validity={manager.validity} />
            <td>
              <a
                href="{base}/organisation/{$page.params
                  .uuid}/edit/manager/{manager.uuid}"
              >
                <Icon type="pen" />
              </a>
            </td>
            <td>
              <a
                href="{base}/organisation/{$page.params
                  .uuid}/terminate/manager/{manager.uuid}"
              >
                <Icon type="xmark" size="30" />
              </a>
            </td>
          {:else}
            <a href="{base}/organisation/{manager.org_unit[0].uuid}">
              <td class="p-4">{manager.org_unit[0].name}</td>
            </a>
            <!-- This needs to return a list -->
            <td class="p-4">
              <ul>
                {#each manager.responsibilities as responsibility}
                  <li>
                    • {responsibility.name}
                  </li>
                {/each}
              </ul>
            </td>
            <td class="p-4">{manager.manager_type.name}</td>
            <td class="p-4">{manager.manager_level.name}</td>
            <ValidityTableCell validity={manager.validity} />
            <td>
              <a href="{base}/employee/{$page.params.uuid}/edit/manager/{manager.uuid}">
                <Icon type="pen" />
              </a>
            </td>
            <td>
              <a
                href="{base}/employee/{$page.params
                  .uuid}/terminate/manager/{manager.uuid}"
              >
                <Icon type="xmark" size="30" />
              </a>
            </td>
          {/if}
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
