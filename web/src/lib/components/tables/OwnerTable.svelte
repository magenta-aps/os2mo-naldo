<script lang="ts">
  import { _ } from "svelte-i18n"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import {
    EmployeeAndOrgOwnerDocument,
    type EmployeeAndOrgOwnerQuery,
  } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type Owner = EmployeeAndOrgOwnerQuery["owners"]["objects"][0]["objects"]
  let data: Owner

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query EmployeeAndOrgOwner(
      $employee_uuid: [UUID!]
      $org_uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      owners(
        filter: {
          employees: $employee_uuid
          org_units: $org_uuid
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          objects {
            uuid
            validity {
              from
              to
            }
            person {
              name
              uuid
            }
            org_unit {
              name
              uuid
            }
            owner {
              name
              uuid
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
    const res = await graphQLClient().request(EmployeeAndOrgOwnerDocument, {
      org_uuid: org_unit,
      employee_uuid: employee,
      ...tenseToValidity(tense, $date),
    })

    const owners: Owner = []

    // Filters and flattens the data
    for (const outer of res.owners.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      owners.push(...filtered)
    }
    data = owners
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">Henter data...</td>
  </tr>
{:else}
  {#each data as ownerObj}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <a href="{base}/employee/{ownerObj.owner ? ownerObj.owner[0].uuid : ''}">
        <td class="p-4">{ownerObj.owner ? ownerObj.owner[0].name : ""}</td>
      </a>
      <ValidityTableCell validity={ownerObj.validity} />
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/owner/{ownerObj.uuid}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/owner/{ownerObj.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {/each}
{/if}
