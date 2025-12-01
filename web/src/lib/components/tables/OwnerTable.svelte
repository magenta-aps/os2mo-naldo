<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import {
    EmployeeOwnerDocument,
    OrgUnitOwnerDocument,
    type EmployeeOwnerQuery,
    type OrgUnitOwnerQuery,
  } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { findClosestValidity } from "$lib/utils/validities"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { onMount } from "svelte"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  type Owners =
    | EmployeeOwnerQuery["owners"]["objects"][0]["validities"]
    | OrgUnitOwnerQuery["org_units"]["objects"][0]["validities"][0]["owners"]

  let data: Owners

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")

  gql`
    query EmployeeOwner($uuids: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      owners(
        filter: { employee: { uuids: $uuids }, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            uuid
            validity {
              from
              to
            }
            person(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
            }
            org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
            owner(filter: { from_date: $fromDate, to_date: $toDate }) {
              name
              uuid
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    query OrgUnitOwner($uuids: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      org_units(filter: { uuids: $uuids }) {
        objects {
          validities {
            owners(filter: { from_date: $fromDate, to_date: $toDate }, inherit: true) {
              uuid
              validity {
                from
                to
              }
              person(filter: { from_date: $fromDate, to_date: $toDate }) {
                name
                uuid
              }
              org_unit(filter: { from_date: $fromDate, to_date: $toDate }) {
                name
                uuid
                validity {
                  from
                  to
                }
              }
              owner(filter: { from_date: $fromDate, to_date: $toDate }) {
                name
                uuid
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
    const owners: Owners = []

    if (isOrg) {
      const res = await graphQLClient().request(OrgUnitOwnerDocument, {
        uuids: uuid,
        ...tenseToValidity(tense, $date),
      })

      // Filters and flattens the data
      for (const outer of res.org_units.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities[0].owners.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        owners.push(...filtered)
      }
      data = owners
    } else {
      const res = await graphQLClient().request(EmployeeOwnerDocument, {
        uuids: uuid,
        ...tenseToValidity(tense, $date),
      })
      // Filters and flattens the data
      for (const outer of res.owners.objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        owners.push(...filtered)
      }
      data = owners
    }
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-slate-300 text-secondary">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as ownerObj, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
        leading-5 border-t border-slate-300 text-secondary"
    >
      <td class="text-sm p-4">
        {#if ownerObj.owner}
          <a href="{base}/employee/{ownerObj.owner[0].uuid}">
            {findClosestValidity(ownerObj.owner, $date).name}
          </a>
        {:else}
          {capital($_("vacant"))}
        {/if}
        <!-- Add (*) if owner-object is inherited -->
        {#if isOrg && ownerObj.org_unit?.[0].uuid !== $page.params.uuid}
          <span
            title={capital(
              $_("inherited_owner", {
                values: {
                  org_unit: findClosestValidity(ownerObj.org_unit, $date).name,
                },
              })
            )}>(*)</span
          >
        {/if}
      </td>
      <ValidityTableCell validity={ownerObj.validity} />
      {#if env.PUBLIC_AUDITLOG}
        <td>
          <a href={`${base}/auditlog/${ownerObj.uuid}`}>
            <Icon icon={historyRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
      <td>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/owner/{ownerObj.uuid}{formatQueryDates(ownerObj.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      <td>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/owner/{ownerObj.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-slate-300 text-secondary">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("owner", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
