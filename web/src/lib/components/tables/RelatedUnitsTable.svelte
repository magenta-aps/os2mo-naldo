<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { page } from "$app/stores"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { RelatedUnitsDocument, type RelatedUnitsQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { updateGlobalNavigation } from "$lib/stores/navigation"

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
            org_units(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
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
    // Filter out the highlighted org_unit, so we only have the actual relation left.
    // This allows for cleaner templating and sorting by name
    data = relatedUnits.map((unit) =>
      unit.org_units[0].uuid === $page.params.uuid
        ? { org_units: [unit.org_units[1]], validity: unit.validity }
        : { org_units: [unit.org_units[0]], validity: unit.validity }
    )
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as related_unit, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
        leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        <a
          href="{base}/organisation/{related_unit.org_units[0].uuid}"
          on:click={() => updateGlobalNavigation(related_unit.org_units[0].uuid)}
          >{related_unit.org_units[0].name}
        </a>
      </td>
      <ValidityTableCell validity={related_unit.validity} />
    </tr>
  {:else}
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("related_unit", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
