<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { EmployeeDocument, type EmployeeQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"

  type Employees = EmployeeQuery["employees"]["objects"][0]["objects"]
  let data: Employees

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

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(EmployeeDocument, {
      uuid: uuid,
      ...tenseToValidity(tense, $date),
    })
    const engagements: Employees = []

    // Filters and flattens the data
    for (const outer of res.employees.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      engagements.push(...filtered)
    }
    data = engagements
  })
</script>

<DetailTable
  headers={[
    { title: "Navn", sortPath: "name" },
    { title: "Kaldenavn", sortPath: "nickname" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
  ]}
>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as employee}
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
      </tr>
    {/each}
  {/if}
</DetailTable>
