<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeAssociationsDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query EmployeeAssociations($uuid: [UUID!]) {
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

<DetailTable headers={["Enhed", "Rolle", "Dato", "", ""]}>
  {#await graphQLClient().request(EmployeeAssociationsDocument, { uuid: uuid })}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const employee = data.employees[0].objects[0]}
    {#each employee.associations as association}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
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
        <td>
          <a
            aria-disabled
            href="{base}/organisation/{uuid}/edit/association/{association.org_unit[0]
              .uuid}"
          >
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a
            href="{base}/organisation/{uuid}/terminate/association/{association
              .org_unit[0].uuid}"
          >
            <Icon type="xmark" size="30" />
          </a></td
        >
      </tr>
    {/each}
  {/await}
</DetailTable>
