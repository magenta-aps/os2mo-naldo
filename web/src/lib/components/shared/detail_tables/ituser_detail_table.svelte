<script lang="ts">
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import Icon from "$lib/components/icon.svelte"
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

  type ITUsers = ItUsersQuery["itusers"]["objects"][0]["objects"]
  let data: ITUsers

  export let uuid: string
  export let tense: Tense

  const isOrg = $page.route.id?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query ITUsers(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      itusers(
        filter: {
          employees: $employee
          org_units: $org_unit
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
      org_unit: org_unit,
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

<DetailTable
  headers={[
    { title: "IT system", sortPath: "itsystem.name" },
    { title: "Kontonavn", sortPath: "user_key" },
    { title: "Primær" },
    { title: "Dato", sortPath: "validity.from" },
    { title: "" },
    { title: "" },
  ]}
>
  {#if !data}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">Henter data...</td>
    </tr>
  {:else}
    {#each data as ituser}
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
  {/if}
</DetailTable>
