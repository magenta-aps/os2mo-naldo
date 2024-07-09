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

  export let data: any
  export let headers

  // $: {
  //   if (data) {
  //     const results = []

  //     for (const outer of data[mainQuery.operation].objects) {
  //       // TODO: Remove when GraphQL is able to do this for us
  //       const filtered = outer.validities.filter((obj) => {
  //         return tenseFilter(obj, tense)
  //       })
  //       results.push(...filtered)
  //     }

  //     data = results
  //   }
  // }
</script>

<div class="overflow-x-auto rounded border mb-8">
  <table class="border-slate-300 w-full">
    {#if headers}
      <thead class="text-left">
        {#each headers as header}
          <th
            on:click={() => {
              sortTable(header.sortPath || "")
            }}
            class="{header.sortPath ? 'cursor-pointer' : ''} 
                px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
          >
            <div class="flex items-center">
              {$_(header.value)}
              {#if header.sortPath}
                <div class="flex flex-col items-center justify-center pl-1">
                  <Icon
                    icon={keyboardArrowUpRounded}
                    width="16"
                    height="16"
                    class="relative top-1 {$sortKey === header.sortPath &&
                    $sortDirection === -1
                      ? 'opacity-100'
                      : 'opacity-30'}
                    "
                  />
                  <Icon
                    icon={keyboardArrowDownRounded}
                    width="16"
                    height="16"
                    class="relative bottom-1 {$sortKey === header.sortPath &&
                    $sortDirection === 1
                      ? 'opacity-100'
                      : 'opacity-30'}
                    "
                  />
                </div>
              {/if}
            </div>
          </th>
        {/each}
      </thead>
    {/if}
    <tbody class="border-slate-300 min-h-64 text-slate-600">
      {#if !data}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">Intet valgt</td>
        </tr>
      {:else}
        {#each data as searchObject}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            {#each headers as header, i}
              {#if header.value === "name"}
                <td class="p-4">
                  {searchObject.name}
                </td>
              {:else if header.value === "validity"}
                <ValidityTableCell validity={searchObject.validity} />
              {:else}
                <td class="p-4">
                  {searchObject[headers[i].value]?.name
                    ? searchObject[headers[i].value].name
                    : ""}
                </td>
              {/if}
            {/each}
          </tr>
        {:else}
          <tr class="py-4 leading-5 border-t border-slate-300 text-secondary">
            <!-- TODO: Add translated "No <type> in <tense>"-message" -->
            <td class="p-4"
              >{capital(
                $_("no_item", {
                  values: { item: $_("employee", { values: { n: 2 } }) },
                })
              )}</td
            >
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
