<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitManagerDetailDocument } from "./query.generated"
  import { gql } from "graphql-request"

  export let uuid: string
  export let tense: string

  gql`
    query OrgUnitManagerDetail($uuid: [UUID!]) {
      org_units(uuids: $uuid) {
        objects {
          managers {
            uuid
            employee {
              name
              uuid
            }
            responsibilities {
              name
            }
            manager_type {
              name
            }
            manager_level {
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

<DetailTable headers={["Navn", "Lederansvar", "Ledertype", "Lederniveau", "Dato", "", ""]}>
  {#await graphQLClient().request(OrgUnitManagerDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const managers = data.org_units[0].objects[0].managers}
    {#each managers as manager}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <!-- FIXME: `manager.employee` is possibly 'null' or 'undefined' -->
        <!-- if no if-statement. Temporary fix -->
        {#if manager.employee}
            <a href="{base}/employee/{manager.employee[0].uuid}">
                <td class="p-4">{manager.employee[0].name}</td>
            </a>
        {:else}
            <p></p>
        {/if}
        <td class="p-4">
          <ul>
            {#each manager.responsibilities as responsibility}
              <li>
                • {responsibility.name}
              </li>
            {/each}
          </ul>
        </td>
        <td class="p-4"
          >{manager.manager_type ? manager.manager_type.name : "Ikke sat"}</td
        >
        <td class="p-4"
          >{manager.manager_level ? manager.manager_level.name : "Ikke sat"}</td
        >
        <ValidityTableCell validity={manager.validity} />
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/edit/manager/{manager.uuid}">
            <Icon type="pen" />
          </a>
        </td>

        {#if env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"}
          <td>
            <a
              href="{base}/organisation/{$page.params.uuid}/terminate/manager/{manager.uuid}"
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
