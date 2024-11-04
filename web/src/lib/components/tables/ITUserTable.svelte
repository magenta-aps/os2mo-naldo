<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EmployeeItUsersDocument, type EmployeeItUsersQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"

  type ITUsers = EmployeeItUsersQuery["itusers"]["objects"][0]["validities"]
  let data: ITUsers

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query EmployeeITUsers($employee: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      itusers(
        filter: {
          employee: { uuids: $employee }
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            user_key
            uuid
            itsystem {
              name
              uuid
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
    const res = await graphQLClient().request(EmployeeItUsersDocument, {
      employee: uuid,
      ...tenseToValidity(tense, $date),
    })
    const itUsers: ITUsers = []

    // Filters and flattens the data
    for (const outer of res.itusers.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      itUsers.push(...filtered)
    }
    data = itUsers
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as ituser, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
      p-4 leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">{ituser.itsystem.name} </td>
      <td class="text-sm p-4">{ituser.user_key}</td>
      <td class="text-sm p-4">{ituser.primary ? ituser.primary.name : ""}</td>
      <ValidityTableCell validity={ituser.validity} />
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/ituser/{ituser.uuid}{formatQueryDates(ituser.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/ituser/{ituser.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("ituser", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
