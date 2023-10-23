<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { ItAssociationsDocument } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import Icon from "$lib/components/icon.svelte"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  gql`
    query ITAssociations($employee: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      associations(
        filter: {
          employees: $employee
          it_association: true
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
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
    }
  `
</script>

<DetailTable
  headers={[
    { title: "Enhed" },
    { title: "Stillingsbetegnelse" },
    { title: "IT System" },
    { title: "Kontonavn" },
    { title: "Primær" },
    { title: "Dato" },
    { title: "" },
    { title: "" },
  ]}
>
  {#await graphQLClient().request( ItAssociationsDocument, { employee: uuid, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.associations.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as itassociation}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <a href="{base}/organisation/{itassociation.org_unit[0].uuid}">
            <td class="p-4">{itassociation.org_unit[0].name}</td>
          </a>
          <td class="p-4">{itassociation.job_function?.name}</td>
          <td class="p-4">{itassociation.it_user[0].itsystem.name}</td>
          <td class="p-4">{itassociation.it_user[0].user_key}</td>
          <td class="p-4">{itassociation.primary ? itassociation.primary?.name : ""}</td
          >
          <ValidityTableCell validity={itassociation.validity} />
          <td>
            <a href="{base}/employee/{uuid}/edit/itassociation/{itassociation.uuid}">
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
    {/each}
  {/await}
</DetailTable>
