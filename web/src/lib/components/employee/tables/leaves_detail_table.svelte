<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument, type EmployeeLeavesQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"

  export let uuid: string
  export let tense: Tense

  type Leaves = EmployeeLeavesQuery["leaves"]["objects"][0]["objects"]
  let data: Leaves

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

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(EmployeeLeavesDocument, {
      employee_uuid: uuid,
      ...tenseToValidity(tense, $date),
    })
    const leaves: Leaves = []

    // Filters and flattens the data
    for (const outer of res.leaves.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      leaves.push(...filtered)
    }
    data = leaves
  })
</script>

<DetailTable
  headers={[
    { title: "Orlovstype", sortPath: "leave_type.name" },
    { title: "Engagement", sortPath: "engagement.job_function.name" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
    { title: "" },
  ]}
>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as leave}
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
  {/if}
</DetailTable>
