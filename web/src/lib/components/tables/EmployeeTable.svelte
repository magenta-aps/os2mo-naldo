<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { EmployeeDocument, type EmployeeQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  type Employees = EmployeeQuery["employees"]["objects"][0]["validities"]

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query Employee($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      employees(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
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

  $: dataPromise = graphQLClient().request(EmployeeDocument, {
    uuid: uuid,
    ...tenseToValidity(tense, $date),
  }).then((res) => {
    const employees: Employees = []

    // Filters and flattens the data
    for (const outer of res.employees.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      employees.push(...filtered)
    }
    return employees
  })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as employee, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {employee.name}
      </td>
      <td class="text-sm p-4">{employee.nickname}</td>
      <ValidityTableCell validity={employee.validity} />
      <td class="flex text-sm p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${employee.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a href="{base}/employee/{uuid}/edit{formatQueryDates(employee.validity)}">
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/employee/{uuid}/terminate/employee">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
