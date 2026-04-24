<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { ItAssociationsDocument, type ItAssociationsQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { onMount } from "svelte"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import { findClosestValidity, formatQueryDates } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { env } from "$lib/env"

  export let tense: Tense

  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = ItAssociationsQuery["associations"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<
    Row,
    "org_unit_response" | "job_function_response" | "primary_response"
  > & {
    org_unit_response: WithCurrent<Row["org_unit_response"]>
    job_function_response: WithCurrent<Row["job_function_response"]>
    primary_response: WithCurrent<Row["primary_response"]>
  }
  type ItAssociations = EnrichedRow[]
  let data: ItAssociations

  const uuid = $page.params.uuid

  gql`
    query ITAssociations($employee: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      associations(
        filter: {
          employees: $employee
          it_association: true
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
            job_function_response {
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
            it_user_response {
              uuid
              current(at: $fromDate) {
                itsystem_response {
                  uuid
                  current(at: $fromDate) {
                    name
                  }
                }
                user_key
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
    const res = await graphQLClient().request(ItAssociationsDocument, {
      employee: uuid,
      ...tenseToValidity(tense, $date),
    })
    const itAssociations: ItAssociations = []

    // Filters and flattens the data
    for (const outer of res.associations.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      for (const a of filtered as unknown as EnrichedRow[]) {
        const anchor = a.validity.from
        a.org_unit_response = resolve(a.org_unit_response, anchor)!
        a.job_function_response = resolve(a.job_function_response, anchor)
        a.primary_response = resolve(a.primary_response, anchor)
      }
      itAssociations.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = itAssociations
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as itassociation, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        <a
          href="{base}/organisation/{itassociation.org_unit_response.uuid}"
          on:click={() => updateGlobalNavigation(itassociation.org_unit_response.uuid)}
        >
          {itassociation.org_unit_response.current?.name ??
            itassociation.org_unit_response.uuid}
        </a>
      </td>
      <td class="text-sm p-4">{itassociation.job_function_response?.current?.name}</td>
      <td class="text-sm p-4"
        >{itassociation.it_user_response?.current?.itsystem_response?.current?.name}</td
      >
      <td class="text-sm p-4">{itassociation.it_user_response?.current?.user_key}</td>
      <td class="text-sm p-4">{itassociation.primary_response?.current?.name ?? ""}</td>
      <ValidityTableCell validity={itassociation.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${itassociation.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/employee/{uuid}/edit/itassociation/{itassociation.uuid}{formatQueryDates(
            itassociation.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/employee/{uuid}/terminate/itassociation/{itassociation.uuid}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("itassociation", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
