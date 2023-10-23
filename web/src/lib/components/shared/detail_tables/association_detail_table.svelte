<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { AssociationsDocument } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const headers = isOrg
    ? [
        { title: "Navn" },
        { title: "Tilknytningsrolle" },
        { title: "Primær" },
        { title: "Dato" },
        { title: "" },
        { title: "" },
      ]
    : [
        { title: "Enhed" },
        { title: "Rolle" },
        { title: "Primær" },
        { title: "Dato" },
        { title: "" },
        { title: "" },
      ]

  gql`
    query Associations(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      associations(
        filter: {
          employees: $employee
          org_units: $org_unit
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
            employee {
              name
              uuid
            }
            association_type {
              name
            }
            primary {
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

<DetailTable {headers}>
  {#await graphQLClient().request( AssociationsDocument, { org_unit: org_unit, employee: employee, ...tenseToValidity(tense, $date) } )}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:then data}
    {#each data.associations.objects as outer}
      <!-- TODO: Remove when GraphQL is able to do this for us -->
      {@const filteredObjects = outer.objects.filter((obj) => tenseFilter(obj, tense))}
      {#each filteredObjects as association}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          {#if isOrg}
            <a href="{base}/employee/{association.employee[0].uuid}">
              <td class="p-4">{association.employee[0].name}</td>
            </a>
          {:else}
            <a href="{base}/organisation/{association.org_unit[0].uuid}">
              <td class="p-4">{association.org_unit[0].name}</td>
            </a>
          {/if}
          <td class="p-4">{association.association_type?.name}</td>
          <td class="p-4">{association.primary ? association.primary?.name : ""}</td>
          <ValidityTableCell validity={association.validity} />
          <td>
            <a
              href="{base}/{$page.route.id?.split(
                '/'
              )[1]}/{uuid}/edit/association/{association.uuid}"
            >
              <Icon type="pen" />
            </a>
          </td>
          <td>
            <a
              href="{base}/{$page.route.id?.split(
                '/'
              )[1]}/{uuid}/terminate/association/{association.uuid}"
            >
              <Icon type="xmark" size="30" />
            </a>
          </td>
        </tr>
      {/each}
    {/each}
  {/await}
</DetailTable>
