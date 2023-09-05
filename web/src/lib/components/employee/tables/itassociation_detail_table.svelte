<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { ItAssociationsDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { date } from "$lib/stores/date"

  export let uuid: string
  // TODO: Blocked by #57396
  // svelte-ignore unused-export-let
  export let tense: string

  gql`
    query ITAssociations($employee: [UUID!], $fromDate: DateTime) {
      associations(employees: $employee, it_association: true, from_date: $fromDate) {
        objects {
          uuid
          org_unit {
            name
            uuid
          }
          job_function {
            name
          }
          primary {
            name
          }
          it_user {
            itsystem {
              name
            }
            user_key
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

<DetailTable
  headers={[
    "Enhed",
    "Stillingsbetegnelse",
    "IT System",
    "Kontonavn",
    "Primær",
    "Dato",
    "",
    "",
  ]}
>
  {#await graphQLClient().request( ItAssociationsDocument, { employee: uuid, fromDate: $date } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {@const itassociations = data.associations}
    {#each itassociations as itassoc}
      {@const itassociation = itassoc.objects[0]}
      <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
        <a href="{base}/organisation/{itassociation.org_unit[0].uuid}">
          <td class="p-4">{itassociation.org_unit[0].name}</td>
        </a>
        <td class="p-4">{itassociation.job_function?.name}</td>
        <td class="p-4">{itassociation.it_user[0].itsystem.name}</td>
        <td class="p-4">{itassociation.it_user[0].user_key}</td>
        <td class="p-4">{itassociation.primary ? itassociation.primary?.name : ""}</td>
        <ValidityTableCell validity={itassociation.validity} />
        <td>
          <a
            href="{base}/employee/{uuid}/edit/itassociation/{itassociation.uuid}"
          >
            <Icon type="pen" />
          </a>
        </td>
        <td>
          <a
            href="{base}/employee/{uuid}/terminate/itassociation/{itassociation.uuid}"
          >
            <Icon type="xmark" size="30" />
          </a>
        </td>
      </tr>
    {/each}
  {/await}
</DetailTable>
