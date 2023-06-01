<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { AddressesDetailDocument, EmployeeDetailDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"

  export let uuid: string
  export let tense: string

  gql`
    query AddressesDetail($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          addresses {
            name
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

<DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato"]}>
  {#await graphQLClient().request(AddressesDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.addresses as address, i}
      <tr
        class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
      >
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
      </tr>
    {/each}
  {/await}
</DetailTable>
