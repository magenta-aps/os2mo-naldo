<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { AssociationsDocument, type AssociationsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortData } from "$lib/utils/sorting"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import {
    lookupDate,
    findClosestValidity,
    formatQueryDates,
  } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = AssociationsQuery["associations"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<
    Row,
    | "org_unit_response"
    | "person_response"
    | "association_type_response"
    | "trade_union_response"
    | "substitute_response"
    | "primary_response"
  > & {
    org_unit_response: WithCurrent<Row["org_unit_response"]>
    person_response: WithCurrent<Row["person_response"]>
    association_type_response: WithCurrent<Row["association_type_response"]>
    trade_union_response: WithCurrent<Row["trade_union_response"]>
    substitute_response: WithCurrent<Row["substitute_response"]>
    primary_response: WithCurrent<Row["primary_response"]>
  }
  type Associations = EnrichedRow[]
  let data: Associations

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  gql`
    query Associations(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
    ) {
      associations(
        filter: {
          employees: $employee
          it_association: false
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            uuid
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
            person_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            association_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            trade_union_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            substitute_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
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
    const res = await graphQLClient().request(AssociationsDocument, {
      org_unit: org_unit,
      employee: employee,
      ...tenseToValidity(tense, $date),
    })
    const associations: Associations = []

    // Filters and flattens the data
    for (const outer of res.associations.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        if (!tenseFilter(obj, tense)) return false
        // Check if association validity is in current org_unit ($page.params.uuid)
        // TODO: Do this with GraphQL, when following issues are resolved (#65031) (#65303)
        if (isOrg && obj.org_unit_response.uuid !== $page.params.uuid) return false
        return true
      })
      for (const a of filtered as unknown as EnrichedRow[]) {
        const anchor = lookupDate(a.validity, $date)
        a.org_unit_response = resolve(a.org_unit_response, anchor)!
        a.person_response = resolve(a.person_response, anchor)
        a.association_type_response = resolve(a.association_type_response, anchor)
        a.trade_union_response = resolve(a.trade_union_response, anchor)
        a.substitute_response = resolve(a.substitute_response, anchor)
        a.primary_response = resolve(a.primary_response, anchor)
      }
      associations.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = associations
  })
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as association, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          <!-- GraphQL and Naldo doesn't allow creating vacant associations, but the old frontend did -->
          <!-- This means that some customers might have them, and therefore we need this check. -->
          {#if association.person_response?.current?.name}
            <a href="{base}/employee/{association.person_response.uuid}">
              {association.person_response.current.name}
            </a>
          {:else}
            {capital($_("vacant"))}
          {/if}
        {:else}
          <a
            href="{base}/organisation/{association.org_unit_response.uuid}"
            on:click={() => updateGlobalNavigation(association.org_unit_response.uuid)}
          >
            {association.org_unit_response.current?.name ??
              association.org_unit_response.uuid}</a
          >
        {/if}
      </td>
      <td class="text-sm p-4"
        >{association.association_type_response?.current?.name ??
          association.association_type_response?.uuid}</td
      >
      <td class="text-sm p-4">{association.substitute_response?.current?.name ?? ""}</td
      >
      {#if env.PUBLIC_ENABLE_CONFEDERATIONS}
        <td class="text-sm p-4"
          >{association.trade_union_response?.current?.name ?? ""}</td
        >
      {/if}
      {#if env.PUBLIC_SHOW_PRIMARY_ASSOCIATION}
        <td class="text-sm p-4">{association.primary_response?.current?.name ?? ""}</td>
      {/if}
      <ValidityTableCell validity={association.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${association.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/association/{association.uuid}{formatQueryDates(
            association.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/association/{association.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("association", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
