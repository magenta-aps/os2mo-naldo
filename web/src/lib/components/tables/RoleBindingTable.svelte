<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { RolebindingsDocument, type RolebindingsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import {
    tenseFilter,
    tenseToValidity,
    filterTenseToValidity,
  } from "$lib/util/helpers"
  import { onMount } from "svelte"
  import { sortData } from "$lib/util/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import type { RoleBindingFilter } from "$lib/graphql/types"
  import { formatQueryDates } from "$lib/util/helpers"

  type Rolebinding = RolebindingsQuery["rolebindings"]["objects"][0]["objects"]
  let data: Rolebinding

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.route.id?.startsWith("/organisation")
  const filter: RoleBindingFilter = isOrg
    ? { org_unit: { uuids: [uuid] }, ...filterTenseToValidity(tense, $date) }
    : {
        ituser: { employee: { uuids: [uuid] } },
        ...filterTenseToValidity(tense, $date),
      }

  gql`
    query Rolebindings($filter: RoleBindingFilter!) {
      rolebindings(filter: $filter) {
        objects {
          objects {
            uuid
            ituser {
              user_key
              itsystem {
                name
              }
            }
            role {
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
  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  onMount(async () => {
    const res = await graphQLClient().request(RolebindingsDocument, {
      filter: filter,
    })

    const rolebindings: Rolebinding = []

    // Filters and flattens the data
    for (const outer of res.rolebindings.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.objects.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      rolebindings.push(...filtered)
    }
    data = rolebindings
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as rolebindingObj}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4">{rolebindingObj.ituser[0].user_key}</td>
      <td class="text-sm p-4">{rolebindingObj.ituser[0].itsystem.name}</td>
      <td class="text-sm p-4">{rolebindingObj.role[0].name}</td>
      <ValidityTableCell validity={rolebindingObj.validity} />
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/edit/rolebinding/{rolebindingObj.uuid}{formatQueryDates(
            rolebindingObj.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.route.id?.split(
            '/'
          )[1]}/{uuid}/terminate/rolebinding/{rolebindingObj.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("rolebinding", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
