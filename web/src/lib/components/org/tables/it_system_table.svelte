<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitItSystemDetailDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query OrgUnitITSystemDetail($org_unit: [UUID!], $fromDate: DateTime) {
      itusers(filter: { org_units: $org_unit, from_date: $fromDate }) {
        objects {
          objects {
            user_key
            uuid
            itsystem {
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
</script>

<DetailTable headers={["IT system", "Kontonavn", "Dato", "", ""]}>
  {#await graphQLClient().request( OrgUnitItSystemDetailDocument, { org_unit: uuid, fromDate: $date } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const itusers = data.itusers.objects}
    {#each itusers as it}
      {@const ituser = it.objects[0]}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{ituser.itsystem.name}</td>
        <td class="p-4">{ituser.user_key}</td>
        <ValidityTableCell validity={ituser.validity} />
        <td>
          <a href="{base}/organisation/{uuid}/edit/it/{ituser.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/organisation/{uuid}/terminate/it/{ituser.uuid}">
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/await}
</DetailTable>
