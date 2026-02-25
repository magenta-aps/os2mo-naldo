<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument, type EmployeeLeavesQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { findClosestValidity } from "$lib/utils/validities"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  type Leaves = EmployeeLeavesQuery["leaves"]["objects"][0]["validities"]
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
          validities {
            uuid
            validity {
              from
              to
            }
            leave_type {
              name
            }
            engagement(filter: { from_date: $fromDate, to_date: $toDate }) {
              org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
                name
                validity {
                  from
                  to
                }
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
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      leaves.push(...filtered)
    }
    data = leaves
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as leave, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {leave.leave_type.name}
      </td>
      <td class="text-sm p-4">
        {leave.engagement.job_function.name}, {findClosestValidity(
          leave.engagement.org_unit,
          $date
        ).name}
      </td>
      <ValidityTableCell validity={leave.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${leave.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/employee/{uuid}/edit/leave/{leave.uuid}{formatQueryDates(
            leave.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/employee/{uuid}/terminate/leave/{leave.uuid}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("leave", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
