<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { page } from "$app/stores"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { RelatedUnitsDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"

  export let uuid: string

  gql`
    query RelatedUnits($org_unit: [UUID!], $fromDate: DateTime) {
      related_units(filter: { org_units: $org_unit, from_date: $fromDate }) {
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
</script>

<DetailTable headers={["Relateret enhed", "Dato"]}>
  {#await graphQLClient().request( RelatedUnitsDocument, { org_unit: uuid, fromDate: $date } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const related_units = data.related_units.objects}
    {#each related_units as related}
      {@const related_unit = related.objects[0]}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        {#if related_unit.org_units[0].uuid == $page.params.uuid}
          <a href="{base}/organisation/{related_unit.org_units[1].uuid}">
            <td class="p-4">{related_unit.org_units[1].name}</td>
          </a>
        {:else}
          <a href="{base}/organisation/{related_unit.org_units[0].uuid}">
            <td class="p-4">{related_unit.org_units[0].name}</td>
          </a>
        {/if}
        <ValidityTableCell validity={related_unit.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
