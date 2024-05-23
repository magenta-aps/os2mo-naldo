<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { EmployeeDocument, type EmployeeQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"

  type Employees = EmployeeQuery["employees"]["objects"][0]["objects"]
  let data: Employees

  export let tense: Tense

  const uuid = $page.params.uuid

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

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
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
        <a href="{base}/employee/{uuid}/edit{formatQueryDates(employee.validity)}">
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
