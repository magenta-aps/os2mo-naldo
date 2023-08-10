<script lang="ts">
    import DetailTable from "$lib/components/shared/detail_table.svelte"
    import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
    import Icon from "$lib/components/icon.svelte"
    import { base } from "$app/paths"
    import { graphQLClient } from "$lib/util/http"
    import { gql } from "graphql-request"
    import { page } from "$app/stores"
    import { AssociationsDocument } from "./query.generated"
  
    export let uuid: string
    export let tense: string
  
    const isOrg = $page.route.id?.startsWith("/organisation")
    const employee = isOrg ? null : $page.params.uuid
    const org_unit = isOrg ? $page.params.uuid : null
    const headers = isOrg ? ["Navn", "Tilknytningsrolle", "Primær", "Dato", "", ""] : ["Enhed", "Rolle", "Primær", "Dato", "", ""]

    gql`
      query Associations($employee: [UUID!], $org_unit: [UUID!]) {
        associations(employees: $employee, org_units: $org_unit) {
          objects {
            uuid
            org_unit {
              name
              uuid
            }
            employee {
              name
              uuid
            }
            association_type {
              name
            }
            primary {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
    `
  </script>
  
  <DetailTable {headers}>
    {#await graphQLClient().request( AssociationsDocument, { org_unit: org_unit, employee: employee } )}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">Henter data...</td>
      </tr>
    {:then data}
      {@const association = data.associations}
      {#each association as assoc}
        {@const association = assoc.objects[0]}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          {#if isOrg}
            <a href="{base}/employee/{association.employee[0].uuid}">
              <td class="p-4">{association.employee[0].name}</td>
            </a>
          {:else}
            <a href="{base}/organisation/{association.org_unit[0].uuid}">
              <td class="p-4">{association.org_unit[0].name}</td>
            </a>
          {/if}
          <td class="p-4">{association.association_type?.name}</td>
          <td class="p-4">{association.primary ? association.primary?.name : ""}</td>
          <ValidityTableCell validity={association.validity} />
          <td>
            <a
              href="{base}/{$page.route.id?.split('/')[1]}/{$page.params
                .uuid}/edit/association/{association.uuid}"
            >
              <Icon type="pen" />
            </a>
          </td>
          <td>
            <a
              href="{base}/{$page.route.id?.split('/')[1]}/{$page.params
                .uuid}/terminate/association/{association.uuid}"
            >
              <Icon type="xmark" size="30" />
            </a>
          </td>
        </tr>
      {/each}
    {/await}
  </DetailTable>