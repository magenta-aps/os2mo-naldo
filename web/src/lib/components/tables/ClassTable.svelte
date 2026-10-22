<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { tenseToValidity, tenseFilter } from "$lib/utils/tenses"
  import { findClosestValidityWithin, formatQueryDates } from "$lib/utils/validities"
  import NameWithHistory from "$lib/components/shared/NameWithHistory.svelte"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { ClassDocument, type ClassQuery } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"

  type Class = ClassQuery["classes"]["objects"][0]["validities"][0]
  // Precomputed so column sorting matches the displayed name
  type Classes = (Class & { owner_name?: string | null })[]

  export let tense: Tense
  export let facetUuid: string
  export let isRoleFacet: boolean = false
  export let isTradeUnionFacet: boolean = false

  gql`
    query Class($facetUuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      classes(
        filter: { facet: { uuids: $facetUuid }, from_date: $fromDate, to_date: $toDate }
      ) {
        objects {
          validities {
            name
            user_key
            uuid
            facet_uuid
            it_system_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            parent_response {
              uuid
              current(at: $fromDate) {
                name
              }
            }
            owner_response {
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

  $: dataPromise = facetUuid
    ? graphQLClient()
        .request(ClassDocument, {
          facetUuid: facetUuid,
          ...tenseToValidity(tense, $date),
        })
        .then((res) => {
          const classes: Classes = []

          // Filters and flattens the data
          for (const outer of res.classes.objects) {
            // TODO: Remove when GraphQL is able to do this for us
            const filtered = outer.validities.filter((obj) => {
              return tenseFilter(obj, tense)
            })
            classes.push(
              ...filtered.map((obj) => ({
                ...obj,
                owner_name: findClosestValidityWithin(
                  obj.owner_response?.validities,
                  obj.validity,
                  $date
                )?.name,
              }))
            )
          }
          return classes
        })
    : Promise.resolve([] as Classes)
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  {#each sortData(data, $sortKey, $sortDirection) as cls, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{cls.name}</td>
      <td class="text-sm p-4">{cls.user_key}</td>
      {#if isRoleFacet}
        <td class="text-sm p-4">
          {#if cls.it_system_response}
            <NameWithHistory
              id="{cls.uuid}-itsystem"
              validities={cls.it_system_response.validities}
              rowValidity={cls.validity}
              fallback={cls.it_system_response.uuid}
            />
          {/if}
        </td>
      {/if}
      {#if isTradeUnionFacet}
        <td class="text-sm p-4">{cls.parent_response?.current?.name ?? ""}</td>
      {/if}
      <td class="text-sm p-4">
        {#if cls.owner_response}
          <NameWithHistory
            id="{cls.uuid}-owner"
            validities={cls.owner_response.validities}
            rowValidity={cls.validity}
            fallback={cls.owner_response.uuid}
          />
        {/if}
      </td>
      <ValidityTableCell validity={cls.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${cls.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/facet/{cls.facet_uuid}/edit/class/{cls.uuid}{formatQueryDates(
            cls.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        {#if env.PUBLIC_ENABLE_CLASS_TERMINATION}
          <a
            href="{base}/{$page.url.pathname?.split(
              '/'
            )[1]}/facet/{cls.facet_uuid}/terminate/class/{cls.uuid}"
          >
            <Icon icon={cancelOutlineRounded} width="25" height="25" />
          </a>
        {/if}
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("class", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
