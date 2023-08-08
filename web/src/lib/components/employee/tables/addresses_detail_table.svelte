<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeAddressesDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { page } from "$app/stores"

  export let tense: string

  gql`
    query EmployeeAddresses($uuid: [UUID!]) {
      employees(uuids: $uuid) {
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
  {#await graphQLClient().request( EmployeeAddressesDocument, { uuid: $page.params.uuid } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.addresses as address}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">
          {address.address_type.name}
        </td>
        <td class="p-4 min-w-[12rem] whitespace-normal">
          {address.name}
        </td>
        <td class="p-4">
          {address.visibility ? address.visibility.name : "Ikke sat"}
        </td>
        <ValidityTableCell validity={address.validity} />
        <td>
          <a aria-disabled href="{base}/employee/{$page.params.uuid}/edit/address/{address.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a href="{base}/employee/{$page.params.uuid}/terminate/address/{address.uuid}">
            <Icon type="xmark" size="30" />
          </a></td
        >
      </tr>
    {/each}
  {/await}
</DetailTable>
