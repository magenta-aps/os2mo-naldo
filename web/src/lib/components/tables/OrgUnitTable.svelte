<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/http/client"
  import { OrgUnitDocument, type OrgUnitQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { onMount } from "svelte"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import {
    type EnrichResponses,
    lookupDate,
    resolveCurrent,
    formatQueryDates,
  } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  type Row = OrgUnitQuery["org_units"]["objects"][0]["validities"][number]
  type EnrichedRow = EnrichResponses<
    Row,
    | "unit_type_response"
    | "unit_level_response"
    | "parent_response"
    | "time_planning_response"
  >
  type OrgUnits = EnrichedRow[]
  let data: OrgUnits

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            name
            uuid
            unit_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            unit_level_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            parent_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            time_planning_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
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

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(OrgUnitDocument, {
      uuid: uuid,
      ...tenseToValidity(tense, $date),
    })

    const orgUnits: OrgUnits = []

    // Filters and flattens the data
    for (const outer of res.org_units.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      for (const o of filtered as unknown as EnrichedRow[]) {
        const anchor = lookupDate(o.validity, $date)
        o.unit_type_response = resolveCurrent(o.unit_type_response, anchor)
        o.unit_level_response = resolveCurrent(o.unit_level_response, anchor)
        o.parent_response = resolveCurrent(o.parent_response, anchor)
        o.time_planning_response = resolveCurrent(o.time_planning_response, anchor)
      }
      orgUnits.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = orgUnits
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as org_unit, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{org_unit.name}</td>
      <td class="text-sm p-4"
        >{org_unit.unit_type_response?.current?.name ?? capital($_("not_set"))}</td
      >
      {#if env.PUBLIC_SHOW_ORG_UNIT_LEVEL}
        <td class="text-sm p-4"
          >{org_unit.unit_level_response?.current?.name ?? capital($_("not_set"))}</td
        >
      {/if}
      <td class="text-sm p-4">
        {#if org_unit.parent_response}
          <a href="{base}/organisation/{org_unit.parent_response.uuid}">
            {org_unit.parent_response.current?.name ?? org_unit.parent_response.uuid}
          </a>
        {:else}
          {capital(
            $_("no_item", { values: { item: $_("parent", { values: { n: 1 } }) } })
          )}
        {/if}
      </td>
      {#if env.PUBLIC_SHOW_TIME_PLANNING}
        <td class="text-sm p-4">
          {org_unit.time_planning_response?.current?.name ?? capital($_("not_set"))}
        </td>
      {/if}
      <ValidityTableCell validity={org_unit.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${org_unit.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/organisation/{$page.params.uuid}/edit/unit{formatQueryDates(
            org_unit.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/organisation/{$page.params.uuid}/terminate/unit">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("org_unit", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
