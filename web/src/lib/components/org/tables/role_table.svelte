<script lang="ts">
    import DetailTable from "$lib/components/shared/detail_table.svelte"
    import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
    import Icon from "$lib/components/icon.svelte"
    import { base } from "$app/paths"
    import { page } from "$app/stores"
    import { graphQLClient } from "$lib/util/http"
    import { OrgUnitRoleDetailDocument } from "./query.generated"
    import { gql } from "graphql-request"
  
    export let uuid: string
    export let tense: string
  
    gql`
      query OrgUnitRoleDetail($uuid: [UUID!]) {
        org_units(uuids: $uuid) {
          objects {
            roles {
                employee {
                    name
                    uuid
                }
                role_type {
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
  
  <DetailTable headers={["Navn", "Rolletype", "Dato"]}>
    {#await graphQLClient().request(OrgUnitRoleDetailDocument, { uuid: uuid })}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">Henter data...</td>
      </tr>
    {:then data}
      {@const roles = data.org_units[0].objects[0].roles}
      {#each roles as role}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <a href="{base}/employee/{role.employee[0].uuid}">
          <td class="p-4">{role.employee[0].name}</td>
        </a>
        <td class="p-4">{role.role_type.name}</td>
        <ValidityTableCell validity={role.validity} />
      </tr>
      {/each}
    {/await}
  </DetailTable>
  