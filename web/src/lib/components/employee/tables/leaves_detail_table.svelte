<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  gql`
    query EmployeeLeaves(
      $employee_uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      leaves(
        filter: { employees: $employee_uuid, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          objects {
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

<DetailTable
  headers={[
    { title: "Orlovstype" },
    { title: "Engagement" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]}
>
  {#await graphQLClient().request( EmployeeLeavesDocument, { employee_uuid: uuid, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.leaves.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as leave}
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
            <a aria-disabled href="{base}/employee/{uuid}/edit/leave/{leave.uuid}">
              <Icon type="pen" />
            </a>
          </td>
          <td>
            <a href="{base}/employee/{uuid}/terminate/leave/{leave.uuid}">
              <Icon type="xmark" size="30" />
            </a></td
          >
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
