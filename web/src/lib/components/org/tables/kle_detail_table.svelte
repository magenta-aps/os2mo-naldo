<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { KleDocument, type KleQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"

  type KLEs = KleQuery["kles"]["objects"][0]["objects"]
  let data: KLEs

  export let uuid: string
  export let tense: Tense

  gql`
    query Kle($org_unit: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      kles(filter: { org_units: $org_unit, from_date: $fromDate, to_date: $toDate }) {
        objects {
          objects {
            uuid
            kle_number {
              name
            }
            kle_aspects {
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
    const res = await graphQLClient().request(KleDocument, {
      org_unit: uuid,
      ...tenseToValidity(tense, $date),
    })

    const kles: KLEs = []

    // Filters and flattens the data
    for (const outer of res.kles.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      kles.push(...filtered)
    }
    data = kles
  })
</script>

<DetailTable
  headers={[
    { title: "KLE aspekt", sortPath: "kle_aspects[0].name" },
    { title: "KLE nummer", sortPath: "kle_number.name" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
    { title: "" },
  ]}
>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as kle}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">
          <ul>
            {#each kle.kle_aspects as aspect}
              <li>
                • {aspect.name}
              </li>
            {/each}
          </ul>
        </td>
        <td class="p-4">{kle.kle_number.name}</td>
        <ValidityTableCell validity={kle.validity} />
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/edit/kle/{kle.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/terminate/kle/{kle.uuid}">
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/if}
</DetailTable>
