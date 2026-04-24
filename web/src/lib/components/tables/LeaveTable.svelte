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
    type WithCurrent,
    lookupDate,
    findClosestValidity,
    resolveCurrent,
    formatQueryDates,
  } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  type Row = EmployeeLeavesQuery["leaves"]["objects"][0]["validities"][number]
  // engagement_response is resolved in two passes: first we pick the
  // engagement validity closest to the leave's lookupDate, then within it
  // we enrich the nested org_unit/job_function at the engagement's own
  // lookupDate. That way a leave pointing at a terminated engagement still
  // renders the engagement's historical fields instead of blank.
  type EngagementValidity = NonNullable<
    Row["engagement_response"]
  >["validities"][number]
  type EnrichedEngagementCurrent = Omit<
    EngagementValidity,
    "org_unit_response" | "job_function_response"
  > & {
    org_unit_response: WithCurrent<EngagementValidity["org_unit_response"]>
    job_function_response: WithCurrent<EngagementValidity["job_function_response"]>
  }
  type EnrichedRow = Omit<Row, "leave_type_response" | "engagement_response"> & {
    leave_type_response: WithCurrent<Row["leave_type_response"]>
    engagement_response:
      | (Row["engagement_response"] & { current: EnrichedEngagementCurrent | null })
      | null
      | undefined
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
              validities(start: null, end: null) {
                validity {
                  from
                  to
                }
                org_unit_response {
                  uuid
                  validities(start: null, end: null) {
                    name
                    validity {
                      from
                      to
                    }
                  }
                }
                job_function_response {
                  uuid
                  validities(start: null, end: null) {
                    name
                    validity {
                      from
                      to
                    }
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
        const anchor = lookupDate(l.validity, $date)
        l.leave_type_response = resolveCurrent(l.leave_type_response, anchor)!

        // engagement_response: pick the engagement validity closest to the
        // leave's anchor, then resolve the nested classes at that engagement
        // validity's OWN lookupDate. `engagement` here is a snapshot of the
        // engagement at a past point in time, not "today".
        const engagement = l.engagement_response
        if (engagement) {
          const engagementCurrent = findClosestValidity(engagement.validities, anchor)
          if (engagementCurrent) {
            const engagementAnchor = lookupDate(engagementCurrent.validity, $date)
            engagement.current = {
              ...engagementCurrent,
              org_unit_response: resolveCurrent(
                engagementCurrent.org_unit_response,
                engagementAnchor
              )!,
              job_function_response: resolveCurrent(
                engagementCurrent.job_function_response,
                engagementAnchor
              )!,
            }
          } else {
            engagement.current = null
          }
        }
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
        {leave.engagement_response?.current?.job_function_response?.current?.name ??
          leave.engagement_response?.current?.job_function_response?.uuid}, {leave
          .engagement_response?.current?.org_unit_response?.current?.name ??
          leave.engagement_response?.current?.org_unit_response?.uuid}
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
