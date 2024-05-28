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

  type RelatedUnits = RelatedUnitsQuery["related_units"]["objects"][0]["objects"]
  let data: RelatedUnits

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      related_units(
        filter: { org_units: $org_unit, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          objects {
            org_units {
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
    const relatedUnits: RelatedUnits = []

    for (const outer of res.related_units.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      relatedUnits.push(...filtered)
    }
    data = relatedUnits
  })
</script>

<!-- TODO: We can't sort on name, since we don't know if we use [0] or [1] -->
{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as related_unit}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">
        {#if related_unit.org_units[0].uuid == $page.params.uuid}
          <a href="{base}/organisation/{related_unit.org_units[1].uuid}">
            {related_unit.org_units[1].name}
          </a>
        {:else}
          <a href="{base}/organisation/{related_unit.org_units[0].uuid}">
            {related_unit.org_units[0].name}
          </a>
        {/if}
      </td>
      <ValidityTableCell validity={related_unit.validity} />
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("related_unit", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
