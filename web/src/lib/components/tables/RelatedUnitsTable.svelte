<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { page } from "$app/stores"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { RelatedUnitsDocument, type RelatedUnitsQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { findClosestValidity } from "$lib/utils/validities"

  type RelatedUnits = RelatedUnitsQuery["related_units"]["objects"][0]["validities"]
  type RelatedUnit = RelatedUnitsQuery["related_units"]["objects"][0]["validities"]
  let data: RelatedUnits

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      related_units(
        filter: { org_units: $org_unit, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            uuid
            org_units(filter: { from_date: null, to_date: null }) {
              name
              uuid
              validity {
                from
                to
              }
              root_response {
                current(at: $fromDate) {
                  name
                  uuid
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
    const res = await graphQLClient().request(RelatedUnitsDocument, {
      org_unit: uuid,
      fromDate: $date,
      ...tenseToValidity(tense, $date),
    })
    const relatedUnits = []

    for (const outer of res.related_units.objects) {
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      relatedUnits.push(...filtered)
    }
    // A relation links two distinct units. `org_units` is queried with
    // `from_date: null, to_date: null`, so every temporal slice of both units is
    // returned even when a unit's dates are inconsistent (e.g. imported data).
    // Drop the unit we're already looking at and pick the slice of the other one
    // closest to the selected date. If the other unit is absent entirely, leave
    // org_units empty so the row renders blank instead of indexing into nothing.
    data = relatedUnits.map((unit) => {
      const related = findClosestValidity(
        unit.org_units.filter((org_unit) => org_unit.uuid !== $page.params.uuid),
        $date
      )
      return {
        uuid: unit.uuid,
        org_units: related ? [related] : [],
        validity: unit.validity,
      }
    })
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as related_unit, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {#if related_unit.org_units[0]}
          <a
            href="{base}/organisation/{related_unit.org_units[0].uuid}"
            on:click={() => updateGlobalNavigation(related_unit.org_units[0].uuid)}
            >{related_unit.org_units[0].name}
          </a>
        {/if}
      </td>
      <td class="text-sm p-4">
        {#if related_unit.org_units[0]?.root_response?.current}
          <a
            href="{base}/organisation/{related_unit.org_units[0].root_response?.current
              ?.uuid}"
            on:click={() =>
              updateGlobalNavigation(
                related_unit.org_units[0].root_response?.current?.uuid
              )}
            >{related_unit.org_units[0].root_response.current.name}
          </a>
        {/if}
      </td>
      <ValidityTableCell validity={related_unit.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${related_unit.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("related_unit", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
