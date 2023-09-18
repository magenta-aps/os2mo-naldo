<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          objects {
            name
            uuid
            unit_type {
              name
            }
            org_unit_level {
              name
            }
            parent {
              name
              uuid
              parent {
                name
              }
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

<DetailTable
  headers={env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"
    ? ["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato", "", ""]
    : ["Enhed", "Enhedstype", "Enhedsniveau", "Overenhed", "Dato", ""]}
>
  {#await graphQLClient().request( OrgUnitDocument, { uuid: uuid, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.org_units.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as org_unit}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">{org_unit.name}</td>
          <td class="p-4"
            >{org_unit.unit_type ? org_unit.unit_type.name : "Ikke sat"}</td
          >
          <td class="p-4"
            >{org_unit.org_unit_level ? org_unit.org_unit_level.name : "Ikke sat"}</td
          >
          {#if org_unit.parent}
            <a href="{base}/organisation/{org_unit.parent.uuid}">
              <td class="p-4">{org_unit.parent.name}</td>
            </a>
          {:else}
            <td class="p-4">Ingen overenhed</td>
          {/if}
          <ValidityTableCell validity={org_unit.validity} />
          <td>
            <a href="{base}/organisation/{$page.params.uuid}/edit">
              <Icon type="pen" />
            </a>
          </td>

          {#if env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"}
            <td>
              <a
                href="{base}/organisation/{$page.params.uuid}/terminate"
                class="hover:slate-300"
              >
                <Icon type="xmark" size="30" />
              </a>
            </td>
          {/if}
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
