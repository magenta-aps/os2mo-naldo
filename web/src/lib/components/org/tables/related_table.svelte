<script lang="ts">
    import DetailTable from "$lib/components/shared/detail_table.svelte"
    import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
    import { page } from "$app/stores"
    import { base } from "$app/paths"
    import { graphQLClient } from "$lib/util/http"
    import { OrgUnitRelatedDetailDocument } from "./query.generated"
    import { gql } from "graphql-request"
  
    export let uuid: string
    export let tense: string
  
    gql`
      query OrgUnitRelatedDetail($uuid: [UUID!]) {
        org_units(uuids: $uuid) {
          objects {
            related_units {
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
  <!-- 2x related unit seems confusing, idk if we can get away with just having
    1 field for the related unit. But if we have to have both, I think we should rename them -->
  <DetailTable headers={["Relateret enhed", "Dato"]}>
    {#await graphQLClient().request(OrgUnitRelatedDetailDocument, { uuid: uuid })}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">Henter data...</td>
      </tr>
    {:then data}
      {@const related_units = data.org_units[0].objects[0].related_units}
      {#each related_units as related_unit}
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
  