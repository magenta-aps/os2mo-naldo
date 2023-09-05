<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { ItUsersDocument } from "./query.generated"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = ["IT system", "Kontonavn", "Primær", "Dato", "", ""]

  gql`
    query ITUsers($employee: [UUID!], $org_unit: [UUID!]) {
      itusers(employees: $employee, org_units: $org_unit) {
        objects {
          user_key
          uuid
          itsystem {
            name
          }
          validity {
            from
            to
          }
          primary {
            uuid
            name
          }
        }
      }
    }
  `
</script>

<DetailTable {headers}>
  {#await graphQLClient().request( ItUsersDocument, { org_unit: org_unit, employee: employee } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const itusers = data.itusers}
    {#each itusers as it}
      {@const ituser = it.objects[0]}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <td class="p-4">{ituser.itsystem.name}</td>
        <td class="p-4">{ituser.user_key}</td>
        <td class="p-4">{ituser.primary ? ituser.primary.name : ""}</td>
        <ValidityTableCell validity={ituser.validity} />
        <td>
          <a href="{base}/{$page.route.id?.split('/')[1]}/{uuid}/edit/it/{ituser.uuid}">
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a
            href="{base}/{$page.route.id?.split(
              '/'
            )[1]}/{uuid}/terminate/it/{ituser.uuid}"
          >
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/await}
</DetailTable>
