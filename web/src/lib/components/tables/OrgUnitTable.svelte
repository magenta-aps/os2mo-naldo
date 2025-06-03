<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, type OrgUnitQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"
  import { MOConfig } from "$lib/stores/config"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$env/dynamic/public"

  type OrgUnits = OrgUnitQuery["org_units"]["objects"][0]["validities"]
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
            unit_type {
              name
            }
            org_unit_level {
              name
            }
            parent(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              parent {
                name
              }
            }
            parent_uuid
            time_planning {
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
      orgUnits.push(...filtered)
    }
    data = orgUnits
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as org_unit, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
        leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">{org_unit.name}</td>
      <td class="text-sm p-4"
        >{org_unit.unit_type ? org_unit.unit_type.name : capital($_("not_set"))}</td
      >
      {#if $MOConfig && $MOConfig.confdb_show_level === "true"}
        <td class="text-sm p-4"
          >{org_unit.org_unit_level
            ? org_unit.org_unit_level.name
            : capital($_("not_set"))}</td
        >
      {/if}
      <td class="text-sm p-4">
        {#if org_unit.parent}
          <a href="{base}/organisation/{org_unit.parent_uuid}">
            <!-- Fall back to ugly UUID if the parent doesn't exist today -->
            {org_unit.parent ? org_unit.parent.name : org_unit.parent_uuid}
          </a>
        {:else}
          {capital(
            $_("no_item", { values: { item: $_("parent", { values: { n: 1 } }) } })
          )}
        {/if}
      </td>
      {#if $MOConfig && $MOConfig.confdb_show_time_planning === "true"}
        <td class="text-sm p-4">
          {org_unit.time_planning
            ? org_unit.time_planning.name
            : capital($_("not_set"))}
        </td>
      {/if}
      <ValidityTableCell validity={org_unit.validity} />
      {#if env.PUBLIC_AUDITLOG === "true"}
        <td>
          <a href={`${base}/auditlog/${org_unit.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/organisation/{$page.params.uuid}/edit/unit{formatQueryDates(
            org_unit.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a href="{base}/organisation/{$page.params.uuid}/terminate/unit">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("org_unit", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
