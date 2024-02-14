<script lang="ts">
  import { _ } from "svelte-i18n"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, type OrgUnitQuery } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"

  type OrgUnits = OrgUnitQuery["org_units"]["objects"][0]["objects"]
  let data: OrgUnits

  export let tense: Tense

  const uuid = $page.params.uuid

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

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(OrgUnitDocument, {
      uuid: uuid,
      ...tenseToValidity(tense, $date),
    })

    const orgUnits: OrgUnits = []

    // Filters and flattens the data
    for (const outer of res.org_units.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      orgUnits.push(...filtered)
    }
    data = orgUnits
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">Henter data...</td>
  </tr>
{:else}
  {#each data as org_unit}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">{org_unit.name}</td>
      <td class="p-4">{org_unit.unit_type ? org_unit.unit_type.name : "Ikke sat"}</td>
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
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="p-4">Ingen enheder</td>
    </tr>
  {/each}
{/if}
