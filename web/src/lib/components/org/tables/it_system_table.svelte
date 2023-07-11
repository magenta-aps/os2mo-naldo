<script lang="ts">
    import DetailTable from "$lib/components/shared/detail_table.svelte"
    import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
    import Icon from "$lib/components/icon.svelte"
    import { base } from "$app/paths"
    import { page } from "$app/stores"
    import { graphQLClient } from "$lib/util/http"
    import { OrgUnitItSystemDetailDocument } from "./query.generated"
    import { gql } from "graphql-request"
  
    export let uuid: string
    export let tense: string
  
    gql`
      query OrgUnitITSystemDetail($uuid: [UUID!]) {
        org_units(uuids: $uuid) {
          objects {
            itusers {
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
    {#await graphQLClient().request(OrgUnitItSystemDetailDocument, { uuid: uuid })}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">Henter data...</td>
      </tr>
    {:then data}
      {@const itusers = data.org_units[0].objects[0].itusers}
      {#each itusers as ituser}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{ituser.itsystem.name}</td>
        <td class="p-4">{ituser.user_key}</td>
        <ValidityTableCell validity={ituser.validity} />
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/edit/it/{ituser.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/terminate/it/{ituser.uuid}">
            <Icon type="xmark" size="30" />
          </a>
        </td
        >
      </tr>
      {/each}
    {/await}
  </DetailTable>
  
