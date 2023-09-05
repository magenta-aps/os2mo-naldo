<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitAddressDetailDocument } from "./query.generated"
  import { gql } from "graphql-request"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query OrgUnitAddressDetail($uuid: [UUID!]) {
      org_units(uuids: $uuid) {
        objects {
          addresses {
            name
            uuid
            address_type {
              name
            }
            visibility {
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

<DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato", "", ""]}>
  {#await graphQLClient().request(OrgUnitAddressDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const addresses = data.org_units[0].objects[0].addresses}
    {#each addresses as address}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{address.address_type.name}</td>
        <td class="p-4">{address.name}</td>
        <td class="p-4">{address.visibility ? address.visibility.name : "Ikke sat"}</td>
        <ValidityTableCell validity={address.validity} />
        <td>
          <a href="{base}/organisation/{$page.params.uuid}/edit/address/{address.uuid}">
            <Icon type="pen" />
          </a>
        </td>

        {#if env.PUBLIC_ENABLE_UNIT_TERMINATE === "true"}
          <td>
            <a
              href="{base}/organisation/{uuid}/terminate/address/{address.uuid}"
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
