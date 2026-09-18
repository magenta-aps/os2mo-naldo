<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EmployeeItUsersDocument, type EmployeeItUsersQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { findClosestValidityWithin } from "$lib/utils/validities"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { getEngagementDisplay } from "$lib/utils/display"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  type ITUsers = EmployeeItUsersQuery["itusers"]["objects"][0]["validities"]

  export let tense: Tense

  const uuid = $page.params.uuid

  // Dates on the engagement lookup filter the engagement's own validity, so a
  // date-filtered lookup drops an engagement that ended before the shown period
  // instead of narrowing it.
  gql`
    query EmployeeITUsers(
      $employee: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $showConnections: Boolean = false
    ) {
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
            itsystem_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            external_id
            engagements_responses(filter: { from_date: null, to_date: null })
              @include(if: $showConnections) {
              objects {
                validities(start: null, end: null) {
                  org_unit_response {
                    uuid
                    validities(start: null, end: null) {
                      name
                      validity {
                        from
                        to
                      }
                    }
                  }
                  extension_1
                  job_function_response {
                    current(at: $fromDate) {
                      user_key
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
            validity {
              from
              to
            }
            primary_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
          }
        }
      }
    }
  `

  $: dataPromise = graphQLClient()
    .request(EmployeeItUsersDocument, {
      employee: uuid,
      showConnections: env.PUBLIC_SHOW_ITUSER_CONNECTIONS,
      ...tenseToValidity(tense, $date),
    })
    .then((res) => {
      const itUsers: ITUsers = []

      // Filters and flattens the data
      for (const outer of res.itusers.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        itUsers.push(...filtered)
      }
      return itUsers
    })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as ituser, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{ituser.itsystem_response.current?.name} </td>
      <td class="text-sm p-4">{ituser.user_key}</td>
      <td class="text-sm p-4">{ituser.external_id ?? ""}</td>
      {#if env.PUBLIC_SHOW_ITUSER_CONNECTIONS}
        <td class="text-sm p-4">
          <!-- Make sure ituser.engagements_responses is present (needed since adding @include to query) -->
          {#if ituser.engagements_responses}
            {#each ituser.engagements_responses.objects as engagement}
              {@const state = findClosestValidityWithin(
                engagement.validities,
                ituser.validity,
                $date
              )}
              {#if state}
                {@const unitName =
                  findClosestValidityWithin(
                    state.org_unit_response?.validities,
                    state.validity,
                    $date
                  )?.name ?? state.org_unit_response?.uuid}
                <div>
                  {getEngagementDisplay(
                    state,
                    unitName,
                    env.PUBLIC_SHOW_JOB_FUNCTION_USER_KEY,
                    env.PUBLIC_SHOW_EXTENSION_1
                  )}
                </div>
              {/if}
            {/each}
          {/if}
        </td>
      {/if}
      <td class="text-sm p-4">{ituser.primary_response?.current?.name ?? ""}</td>
      <ValidityTableCell validity={ituser.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${ituser.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/ituser/{ituser.uuid}{formatQueryDates(ituser.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/ituser/{ituser.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("ituser", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
