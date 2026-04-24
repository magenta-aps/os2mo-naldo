<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { EmployeeLeavesDocument, type EmployeeLeavesQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import {
    lookupDate,
    findClosestValidity,
    formatQueryDates,
  } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = EmployeeLeavesQuery["leaves"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<Row, "leave_type_response"> & {
    leave_type_response: WithCurrent<Row["leave_type_response"]>
  }
  type Leaves = EnrichedRow[]
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
            leave_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            engagement_response {
              uuid
              current(at: $fromDate) {
                org_unit_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                job_function_response {
                  current(at: $fromDate) {
                    name
                  }
                }
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

  // Resolves a related _response's `current` at the row's own anchor date so
  // past rows show the state the related object had at the time, not today's.
  const resolve = <T extends { validities: any[] } | null | undefined>(
    response: T,
    anchor: string
  ) =>
    response
      ? { ...response, current: findClosestValidity(response.validities, anchor) }
      : response

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
      for (const l of filtered as unknown as EnrichedRow[]) {
        l.leave_type_response = resolve(
          l.leave_type_response,
          lookupDate(l.validity, $date)
        )!
      }
      leaves.push(...(filtered as unknown as EnrichedRow[]))
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
        {leave.leave_type_response?.current?.name ?? leave.leave_type_response?.uuid}
      </td>
      <td class="text-sm p-4">
        {leave.engagement_response?.current?.job_function_response?.current?.name}, {leave
          .engagement_response?.current?.org_unit_response?.current?.name}
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
