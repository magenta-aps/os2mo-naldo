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
  import { findClosestValidity } from "$lib/utils/validities"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { getEngagementTitlesAndUuid } from "$lib/utils/display"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  // Note: [number] in this case, does not mean the type `number`
  type EngagementITUser =
    OrgUnitItUsersQuery["byEngagement"]["objects"][0]["validities"][number]
  type OrgUnitITUser =
    OrgUnitItUsersQuery["byOrgUnit"]["objects"][0]["validities"][number]
  type ITUsers = Array<EngagementITUser | OrgUnitITUser>
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
            itsystem {
              name
              uuid
            }
            engagements(filter: { from_date: $fromDate, to_date: $toDate }) {
              validities {
                org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
                  name
                  user_key
                }
                uuid
                job_function {
                  user_key
                  name
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
            primary {
              uuid
              name
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
      itUsers.push(...filtered)
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
      <td class="text-sm p-4">{ituser.itsystem.name} </td>
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
      <td class="text-sm p-4">{ituser.primary ? ituser.primary.name : ""}</td>
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
