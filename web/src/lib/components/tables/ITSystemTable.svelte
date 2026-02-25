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
  import { onMount } from "svelte"
  import { ItSystemDocument, type ItSystemQuery } from "./query.generated"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"

  type ITSystems = ItSystemQuery["itsystems"]["objects"][0]["validities"]
  let data: ITSystems

  export let tense: Tense

  gql`
    query ITSystem($fromDate: DateTime, $toDate: DateTime) {
      itsystems(filter: { from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            name
            user_key
            uuid
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

  onMount(async () => {
    const res = await graphQLClient().request(ItSystemDocument, {
      ...tenseToValidity(tense, $date),
    })
    const itsystems: ITSystems = []

    // Filters and flattens the data
    for (const outer of res.itsystems.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        return tenseFilter(obj, tense)
      })
      itsystems.push(...filtered)
    }
    data = itsystems
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as itsystem, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
        leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">{itsystem.name}</td>
      <td class="text-sm p-4">{itsystem.user_key}</td>
      <ValidityTableCell validity={itsystem.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a
          href="{base}/admin/itsystem/{itsystem.uuid}/edit/{formatQueryDates(
            itsystem.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        {#if env.PUBLIC_ENABLE_CLASS_TERMINATION}
          <a href="{base}/admin/itsystem/{itsystem.uuid}/terminate">
            <Icon icon={cancelOutlineRounded} width="25" height="25" />
          </a>
        {/if}
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("itsystem", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
