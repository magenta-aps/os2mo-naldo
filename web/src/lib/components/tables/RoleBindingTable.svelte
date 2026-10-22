<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { RolebindingsDocument, type RolebindingsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import {
    tenseFilter,
    tenseToValidity,
    filterTenseToValidity,
  } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { findClosestValidityWithin } from "$lib/utils/validities"
  import NameWithHistory from "$lib/components/shared/NameWithHistory.svelte"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import type { RoleBindingFilter } from "$lib/graphql/types"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { formatQueryDates } from "$lib/utils/validities"

  type RolebindingRow = RolebindingsQuery["rolebindings"]["objects"][0]["validities"][0]
  type ItUserState = NonNullable<RolebindingRow["ituser_response"]>["validities"][0]
  // Names precomputed so column sorting matches the displayed names
  type Rolebinding = (RolebindingRow & {
    it_user_state?: ItUserState | null
    it_user_name?: string | null
    itsystem_name?: string | null
  })[]

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const filter: RoleBindingFilter = isOrg
    ? {
        ituser: { org_unit: { uuids: [uuid] }, ...filterTenseToValidity(tense, $date) },
        ...filterTenseToValidity(tense, $date),
      }
    : {
        ituser: { employee: { uuids: [uuid] }, ...filterTenseToValidity(tense, $date) },
        ...filterTenseToValidity(tense, $date),
      }

  gql`
    query Rolebindings(
      $filter: RoleBindingFilter!
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      rolebindings(filter: $filter) {
        objects {
          validities {
            uuid
            ituser_response {
              uuid
              validities(start: null, end: null) {
                # The account name, under the name NameWithHistory reads
                name: user_key
                itsystem_response {
                  uuid
                  validities(start: null, end: null) {
                    name
                    validity {
                      from
                      to
                    }
                  }
                }
                validity {
                  from
                  to
                }
              }
            }
            role_response {
              uuid
              current(at: $fromDate) {
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
  $: dataPromise = graphQLClient()
    .request(RolebindingsDocument, {
      filter: filter,
      ...tenseToValidity(tense, $date),
    })
    .then((res) => {
      const rolebindings: Rolebinding = []

      // Filters and flattens the data
      for (const outer of res.rolebindings.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        rolebindings.push(
          ...filtered.map((obj) => {
            const itUserState = findClosestValidityWithin(
              obj.ituser_response?.validities,
              obj.validity,
              $date
            )
            return {
              ...obj,
              it_user_state: itUserState,
              it_user_name: itUserState?.name,
              itsystem_name: findClosestValidityWithin(
                itUserState?.itsystem_response.validities,
                obj.validity,
                $date
              )?.name,
            }
          })
        )
      }
      return rolebindings
    })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as rolebindingObj, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'}
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {#if rolebindingObj.ituser_response}
          <NameWithHistory
            id="{rolebindingObj.uuid}-it-user"
            validities={rolebindingObj.ituser_response.validities}
            rowValidity={rolebindingObj.validity}
            fallback={rolebindingObj.ituser_response.uuid}
          />
        {/if}
      </td>
      <td class="text-sm p-4">
        {#if rolebindingObj.it_user_state}
          <NameWithHistory
            id="{rolebindingObj.uuid}-itsystem"
            validities={rolebindingObj.it_user_state.itsystem_response.validities}
            rowValidity={rolebindingObj.validity}
            fallback={rolebindingObj.it_user_state.itsystem_response.uuid}
          />
        {/if}
      </td>
      <td class="text-sm p-4">{rolebindingObj.role_response?.current?.name}</td>
      <ValidityTableCell validity={rolebindingObj.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${rolebindingObj.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/rolebinding/{rolebindingObj.uuid}{formatQueryDates(
            rolebindingObj.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/rolebinding/{rolebindingObj.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("rolebinding", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
