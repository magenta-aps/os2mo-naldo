<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { env } from "$lib/env"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { tenseToValidity, tenseFilter } from "$lib/utils/tenses"
  import { formatQueryDates } from "$lib/utils/validities"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { ClassDocument, type ClassQuery } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type Classes = ClassQuery["classes"]["objects"][0]["validities"]
  let data: Classes

  export let tense: Tense
  export let facetUuid: string

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

  const getClasses = async (facetUuid: string) => {
    const res = await graphQLClient().request(ClassDocument, {
      facetUuid: facetUuid,
      ...tenseToValidity(tense, $date),
    })
    const classes: Classes = []

    // Filters and flattens the data
    for (const outer of res.classes.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      classes.push(...filtered)
    }
    data = classes
  }

  $: if (facetUuid) {
    getClasses(facetUuid)
  }
</script>

{#if !data && !facetUuid}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="p-4"
      >{capital(
        $_("no_item", { values: { item: $_("class", { values: { n: 2 } }) } })
      )}</td
    >
  </tr>
{:else if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as cls, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{cls.name}</td>
      <td class="text-sm p-4">{cls.user_key}</td>
      <ValidityTableCell validity={cls.validity} />
      <td>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/facet/{cls.facet_uuid}/edit/class/{cls.uuid}{formatQueryDates(
            cls.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
      </td>
      {#if env.PUBLIC_ENABLE_CLASS_TERMINATION}
        <td>
          <a
            href="{base}/{$page.url.pathname?.split(
              '/'
            )[1]}/facet/{cls.facet_uuid}/terminate/class/{cls.uuid}"
          >
            <Icon icon={cancelOutlineRounded} width="25" height="25" />
          </a>
        </td>
      {/if}
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
{/if}
