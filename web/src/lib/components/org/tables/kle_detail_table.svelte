<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { KleDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

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
              uuid
            }
            kle_aspects {
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
</script>

<!-- TODO: Sorting -->
<DetailTable
  headers={[
    { title: "KLE aspekt" },
    { title: "KLE nummer" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]}
>
  {#await graphQLClient().request( KleDocument, { org_unit: uuid, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.kles.objects as outer}
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as kle}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">{kle.kle_aspects[0].name}</td>
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
    {/each}
  {/await}
</DetailTable>
