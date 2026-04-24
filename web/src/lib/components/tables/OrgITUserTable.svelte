<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { OrgUnitItUsersDocument, type OrgUnitItUsersQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import {
    type WithCurrent,
    lookupDate,
    findClosestValidity,
    resolveCurrent,
  } from "$lib/utils/validities"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { getEngagementTitlesAndUuid } from "$lib/utils/display"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  // The union of byEngagement/byOrgUnit types each need the same enrichment
  // shape, but they don't share the same concrete field set — define locally.
  type Enrich<T extends { itsystem_response: any; primary_response?: any }> = Omit<
    T,
    "itsystem_response" | "primary_response"
  > & {
    itsystem_response: WithCurrent<T["itsystem_response"]>
    primary_response: WithCurrent<T["primary_response"]>
  }
  // Note: [number] in this case, does not mean the type `number`
  type EngagementITUser =
    OrgUnitItUsersQuery["byEngagement"]["objects"][0]["validities"][number]
  type OrgUnitITUser =
    OrgUnitItUsersQuery["byOrgUnit"]["objects"][0]["validities"][number]
  type ITUsers = Array<Enrich<EngagementITUser> | Enrich<OrgUnitITUser>>
  let data: ITUsers

  export let tense: Tense

  const uuid = $page.params.uuid

  gql`
    query OrgUnitITUsers($orgUnit: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      byEngagement: itusers(
        filter: {
          engagement: { org_unit: { uuids: $orgUnit } }
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            user_key
            uuid
            external_id
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
            engagements(filter: { from_date: $fromDate, to_date: $toDate }) {
              validities {
                org_unit_response {
                  uuid
                  current(at: $fromDate) {
                    name
                    user_key
                  }
                }
                uuid
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
            validity {
              from
              to
            }
            primary_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
          }
        }
      }
      byOrgUnit: itusers(
        filter: {
          org_unit: { uuids: $orgUnit }
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            user_key
            uuid
            external_id
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
            primary_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
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
    const res = await graphQLClient().request(OrgUnitItUsersDocument, {
      orgUnit: uuid,
      ...tenseToValidity(tense, $date),
    })
    const itUsers: ITUsers = []

    const combinedItUsers = [...res.byEngagement.objects, ...res.byOrgUnit.objects]

    // Filters and flattens the data
    for (const outer of combinedItUsers) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      for (const u of filtered as unknown as ITUsers) {
        const anchor = lookupDate(u.validity, $date)
        u.itsystem_response = resolveCurrent(u.itsystem_response, anchor)!
        u.primary_response = resolveCurrent(u.primary_response, anchor)
      }
      itUsers.push(...(filtered as unknown as ITUsers))
    }
    data = itUsers
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as ituser, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4"
        >{ituser.itsystem_response.current?.name ?? ituser.itsystem_response.uuid}
      </td>
      <td class="text-sm p-4">{ituser.user_key}</td>
      <td class="text-sm p-4">{ituser.external_id ?? ""}</td>
      {#if env.PUBLIC_SHOW_ITUSER_CONNECTIONS}
        <td class="text-sm p-4">
          {#if "engagements" in ituser}
            {#each ituser.engagements as engagement}
              {#if engagement.validities && engagement.validities.length}
                {#each getEngagementTitlesAndUuid( [findClosestValidity(engagement.validities, $date)] ) as nameObj}
                  <div>{nameObj.name}</div>
                {/each}
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
{/if}
