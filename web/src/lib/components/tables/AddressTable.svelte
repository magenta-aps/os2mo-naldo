<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { tenseToValidity, tenseFilter } from "$lib/utils/tenses"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { AddressDocument, type AddressQuery } from "./query.generated"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import {
    lookupDate,
    findClosestValidity,
    formatQueryDates,
  } from "$lib/utils/validities"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = AddressQuery["addresses"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<Row, "address_type_response" | "visibility_response"> & {
    address_type_response: WithCurrent<Row["address_type_response"]>
    visibility_response: WithCurrent<Row["visibility_response"]>
  }
  type Addresses = EnrichedRow[]
  let data: Addresses

  gql`
    query Address(
      $org_unit: [UUID!]
      $employee: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      addresses(
        filter: {
          org_units: $org_unit
          employees: $employee
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            name
            uuid
            user_key
            value
            address_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            ituser_response {
              uuid
              validities(start: $fromDate, end: $toDate) {
                user_key
                itsystem_response {
                  uuid
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
            visibility_response {
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
      }
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  // Resolves a related _response's `current` at the row's own anchor date so
  // past rows show the state the related object had at the time, not today's.
  const resolve = <T extends { validities: any[] } | null | undefined>(
    response: T,
    anchor: string
  ) =>
    response
      ? { ...response, current: findClosestValidity(response.validities, anchor) }
      : response

  onMount(async () => {
    const res = await graphQLClient().request(AddressDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const addresses: Addresses = []

    // Filters and flattens the data
    for (const outer of res.addresses.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      for (const a of filtered as unknown as EnrichedRow[]) {
        const anchor = lookupDate(a.validity, $date)
        a.address_type_response = resolve(a.address_type_response, anchor)!
        a.visibility_response = resolve(a.visibility_response, anchor)
      }
      addresses.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = addresses
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as address, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4"
        >{address.address_type_response?.current?.name ??
          address.address_type_response?.uuid}</td
      >
      <td class="text-sm p-4"
        >{address.user_key !== address.value && address.user_key !== address.uuid
          ? address.user_key
          : ""}</td
      >
      <td class="text-sm p-4">{address.name}</td>
      {#if env.PUBLIC_SHOW_ITUSER_CONNECTIONS && !isOrg}
        <td class="text-sm p-4">
          {#if address.ituser_response?.validities?.length}
            {@const closest = findClosestValidity(
              address.ituser_response.validities,
              $date
            )}
            {closest?.itsystem_response?.current?.name}, {closest?.user_key}
          {/if}
        </td>
      {/if}
      <td class="text-sm p-4"
        >{address.visibility_response?.current?.name ?? capital($_("not_set"))}</td
      >
      <ValidityTableCell validity={address.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${address.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/address/{address.uuid}{formatQueryDates(address.validity)}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/address/{address.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("address", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
