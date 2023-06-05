<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { AssociationsDetailDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"

  export let uuid: string
  export let tense: string

  gql`
    query AssociationsDetail($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          associations {
            org_unit {
              name
              uuid
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

<DetailTable headers={["Enhed", "Rolle", "Dato"]}>
  {#await graphQLClient().request(AssociationsDetailDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.associations as association, i}
      <tr
        class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
      >
        <a href="{base}/organisation/{association.org_unit[0].uuid}">
          <td class="p-4">
            {association.org_unit[0].name}
          </td>
        </a>
        <td class="p-4">
          {association.association_type
            ? association.association_type.name
            : "Ikke sat"}
        </td>
        <ValidityTableCell validity={association.validity} />
      </tr>
    {/each}
  {/await}
</DetailTable>
