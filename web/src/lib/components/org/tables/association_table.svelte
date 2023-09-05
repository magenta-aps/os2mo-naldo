<script lang="ts">
    import DetailTable from "$lib/components/shared/detail_table.svelte"
    import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
    import Icon from "$lib/components/icon.svelte"
    import { env } from "$env/dynamic/public"
    import { page } from "$app/stores"
    import { base } from "$app/paths"
    import { graphQLClient } from "$lib/util/http"
    import { OrgUnitAssociationDetailDocument } from "./query.generated"
    import { gql } from "graphql-request"
  
    export let uuid: string
    // TODO: Blocked by #57396
    // svelte-ignore unused-export-let
    export let tense: string
  
    gql`
      query OrgUnitAssociationDetail($uuid: [UUID!]) {
        org_units(uuids: $uuid) {
          objects {
            associations {
              uuid
              employee {
                uuid
                name
              }
              substitute {
                name
              }
              association_type {
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
  
  <DetailTable headers={["Navn", "Tilknytningsrolle", "Stedfortræder", "Dato", "", ""]}>
    {#await graphQLClient().request(OrgUnitAssociationDetailDocument, { uuid: uuid })}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">Henter data...</td>
      </tr>
    {:then data}
      {@const associations = data.org_units[0].objects[0].associations}
      {#each associations as association}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <a href="{base}/employee/{association.employee[0].uuid}">
          <td class="p-4">{association.employee[0].name}</td>
        </a>
        <td class="p-4"
          >{association.association_type
            ? association.association_type.name
            : "Ikke sat"}</td
        >
        <td class="p-4">
          {#if association.substitute.length}
            <ul>
              {#each association.substitute as substitute}
                <li>
                  • {substitute.name}
                </li>
              {/each}
            </ul>
          {/if}
        </td>
        <ValidityTableCell validity={association.validity} />
        <td>
            <a href="{base}/organisation/{uuid}/edit/association/{association.uuid}">
              <Icon type="pen" />
            </a>
          </td>
  
          {#if env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"}
            <td>
              <a
                href="{base}/organisation/{uuid}/terminate/association/{association.uuid}"
                class="hover:slate-300"
              >
                <Icon type="xmark" size="30" />
              </a>
            </td>
        {/if}
      </tr>
      {/each}
    {/await}
  </DetailTable>
