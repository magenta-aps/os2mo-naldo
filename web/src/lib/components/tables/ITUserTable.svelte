<script lang="ts">
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { ItUsersDocument, type ItUsersQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type ITUsers = ItUsersQuery["itusers"]["objects"][0]["objects"]
  let data: ITUsers

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const orgUnit = isOrg ? uuid : null

  gql`
    query ITUsers(
      $employee: [UUID!]
      $orgUnit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      itusers(
        filter: {
          employees: $employee
          org_units: $orgUnit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
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
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(ItUsersDocument, {
      orgUnit: orgUnit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const itUsers: ITUsers = []

    // Filters and flattens the data
    for (const outer of res.itusers.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      itUsers.push(...filtered)
    }
    data = itUsers
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">Henter data...</td>
  </tr>
{:else}
  {#each data as ituser, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      p-4 leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="p-4">{ituser.itsystem.name}</td>
      <td class="p-4">{ituser.user_key}</td>
      <td class="p-4">{ituser.primary ? ituser.primary.name : ""}</td>
      <ValidityTableCell validity={ituser.validity} />
      <td>
        <a href="{base}/{$page.route.id?.split('/')[1]}/{uuid}/edit/it/{ituser.uuid}">
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/it/{ituser.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No IT users in <tense>"-message" -->
      <td class="p-4">Ingen IT brugere</td>
    </tr>
  {/each}
{/if}
