<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { EmployeeDocument, type EmployeeQuery } from "./query.generated"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { tenseFilter, tenseToValidity } from "$lib/util/helpers"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/util/sorting"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import { formatQueryDates } from "$lib/util/helpers"

  export let tense: Tense
  export let data
  export let mainQuery

  $: {
    if (data) {
      const results = []

      for (const outer of data[mainQuery.operation].objects) {
        // TODO: Remove when GraphQL is able to do this for us
        const filtered = outer.validities.filter((obj) => {
          return tenseFilter(obj, tense)
        })
        results.push(...filtered)
      }
      console.log(results)
      console.log(mainQuery)

      data = results
    }
  }
</script>

{#if !data}
  <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
    <td class="p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as searchObject}
    {console.log(searchObject)}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td class="p-4">
        <!-- Somehow match fields with values -->
        {#if searchObject.name}
          {searchObject.name}
        {/if}
      </td>
      {#if searchObject.value === "validity"}
        Intet skal ske
      {/if}
    </tr>
  {:else}
    <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
      <!-- TODO: Add translated "No <type> in <tense>"-message" -->
      <td class="p-4"
        >{capital(
          $_("no_item", { values: { item: $_("employee", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
